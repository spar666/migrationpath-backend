import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  ObjectLiteral,
  DeepPartial,
  FindOptionsOrder,
} from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Primary keys in this schema are uuids; numeric keys are allowed for legacy tables. */
export type EntityId = string | number;

/**
 * Postgres error codes we translate into HTTP responses.
 *
 * Named rather than inlined because `23505` at a call site tells the next
 * reader nothing, and the wrong translation here turns a client's mistake into
 * a 500 that looks like ours.
 */
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';

/** The shape of a driver error, without asserting that we got one. */
interface DatabaseError {
  code?: string;
  message?: string;
  detail?: string;
}

function asDatabaseError(error: unknown): DatabaseError {
  return typeof error === 'object' && error !== null ? error : {};
}

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly repository: Repository<T>) {}

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  findAll(filters?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where: filters });
  }

  /**
   * Find a single row by primary key, or 404.
   *
   * Throwing rather than returning null is the contract the whole codebase is
   * written against — callers treat the result as present. A variant that
   * returns null belongs under a different name, not a flag on this one.
   */
  async findById(id: EntityId): Promise<T> {
    const record = await this.repository.findOne({
      // The generic cannot express "T has an id", and constraining it that way
      // would exclude entities keyed on something else. Narrow, and localised
      // to this one lookup.
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!record) {
      throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    }

    return record;
  }

  findWithRelations(
    relations: string[],
    filters?: FindOptionsWhere<T>,
  ): Promise<T[]> {
    return this.repository.find({ where: filters, relations });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update a row by id and return it.
   *
   * One statement, not three. The previous implementation read the row, wrote
   * it, then read it back — so a concurrent delete between the first read and
   * the write produced a silent no-op reported as success, and every update in
   * the system cost three round trips. The affected-row count from the write
   * itself answers "did it exist" without the race.
   */
  async update(id: EntityId, data: Partial<T>): Promise<T> {
    try {
      const result = await this.repository.update(id, data);

      if (result.affected === 0) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }

      return await this.findById(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  async softDelete(id: EntityId): Promise<void> {
    try {
      const result = await this.repository.softDelete(id);
      if (result.affected === 0) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async hardDelete(id: EntityId): Promise<void> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * @deprecated Ambiguous about whether the row survives. Use `softDelete` or
   * `hardDelete` so the call site says which it meant.
   */
  async delete(id: EntityId): Promise<boolean> {
    await this.hardDelete(id);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  /**
   * Paginated query.
   *
   * `sortBy` is checked against the entity's real columns before it reaches the
   * query builder. It used to be interpolated straight in — no caller passes
   * user input today, but this is shared code inherited by every repository,
   * and the first controller to forward a `?sortBy=` query param would have
   * turned that into an injection point without anyone editing this file.
   */
  async paginate(
    page = 1,
    limit = 20,
    filters?: FindOptionsWhere<T>,
    sortBy = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginatedResult<T>> {
    const safePage = Math.max(1, Math.floor(page) || 1);
    // Capped so a caller cannot ask for the whole table in one response.
    const safeLimit = Math.min(Math.max(1, Math.floor(limit) || 20), 200);

    const [data, total] = await this.repository.findAndCount({
      where: filters,
      order: this.buildOrder(sortBy, sortOrder),
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  count(filters?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where: filters });
  }

  async exists(filters: FindOptionsWhere<T>): Promise<boolean> {
    return (await this.count(filters)) > 0;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /**
   * Resolves a sort column against the entity metadata.
   *
   * An unknown column falls back to the default rather than throwing: sorting
   * is a presentation concern, and failing the whole request over it would turn
   * a cosmetic mistake into an outage.
   */
  private buildOrder(
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): FindOptionsOrder<T> {
    const columns = this.repository.metadata.columns.map(
      (column) => column.propertyName,
    );

    if (!columns.includes(sortBy)) {
      this.logger.warn(
        `Ignoring unknown sort column "${sortBy}" on ` +
          `${this.repository.metadata.name}; falling back to created_at.`,
      );
      sortBy = columns.includes('created_at') ? 'created_at' : columns[0];
    }

    return { [sortBy]: sortOrder } as FindOptionsOrder<T>;
  }

  /**
   * Turns a driver error into the right HTTP status.
   *
   * Returns `never`, so callers can `this.handleError(error)` as the last
   * statement of a catch block and TypeScript still sees the happy path as the
   * only way out.
   */
  private handleError(error: unknown): never {
    // Errors we raised deliberately (the 404s above) already carry the right
    // status — re-wrapping them turned every "not found" into a 500.
    if (error instanceof HttpException) {
      throw error;
    }

    const dbError = asDatabaseError(error);
    this.logger.error(`DB error on ${this.repository.metadata.name}`, {
      code: dbError.code,
      message: dbError.message,
    });

    switch (dbError.code) {
      case PG_UNIQUE_VIOLATION:
        throw new HttpException('Record already exists', HttpStatus.CONFLICT);
      case PG_FOREIGN_KEY_VIOLATION:
        throw new HttpException(
          'Foreign key constraint violation',
          HttpStatus.BAD_REQUEST,
        );
      case PG_NOT_NULL_VIOLATION:
        throw new HttpException(
          'A required field was missing',
          HttpStatus.BAD_REQUEST,
        );
      case PG_INVALID_TEXT_REPRESENTATION:
        // Typically a malformed uuid in the path. A 400 rather than a 500:
        // the caller sent something invalid, we did not break.
        throw new HttpException('Malformed identifier', HttpStatus.BAD_REQUEST);
      default:
        // The driver message is deliberately NOT forwarded. It leaks column
        // names, constraint names and sometimes row values to an anonymous
        // caller; the log above keeps it where an engineer can read it.
        throw new HttpException(
          'Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
