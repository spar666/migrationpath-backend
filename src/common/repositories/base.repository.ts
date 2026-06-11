import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  ObjectLiteral,
} from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly repository: Repository<T>) {}

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  /**
   * Find all rows matching optional equality filters.
   */
  async findAll(filters?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({
      where: filters,
    });
  }

  /**
   * Find a single row by its primary key.
   */
  async findById(id: any): Promise<T> {
    const record = await this.repository.findOne({
      where: { id },
    });

    if (!record) {
      throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    }

    return record;
  }

  /**
   * Find rows with related data.
   * In TypeORM, we specify relations explicitly.
   */
  async findWithRelations(
    relations: string[],
    filters?: FindOptionsWhere<T>,
  ): Promise<T[]> {
    return this.repository.find({
      where: filters,
      relations,
    });
  }

  /**
   * Insert a new row and return the created record.
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data as any);
      return await this.repository.save(entity as any);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update a row by ID and return the updated record.
   */
  async update(id: any, data: Partial<T>): Promise<T> {
    try {
      await this.findById(id); // Ensure it exists
      await this.repository.update(id, data);
      return this.findById(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Soft-delete a row.
   */
  async softDelete(id: any): Promise<void> {
    try {
      await this.findById(id); // Ensure it exists
      await this.repository.softDelete(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Hard-delete a row by ID.
   */
  async hardDelete(id: any): Promise<void> {
    try {
      await this.findById(id); // Ensure it exists
      await this.repository.delete(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a row by ID.
   * @deprecated Use softDelete or hardDelete instead.
   */
  async delete(id: any): Promise<boolean> {
    await this.hardDelete(id);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  /**
   * Paginated query with optional equality filters and sorting.
   */
  async paginate(
    page: number = 1,
    limit: number = 20,
    filters?: FindOptionsWhere<T>,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: filters,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // Query Helpers
  // ---------------------------------------------------------------------------

  /**
   * Count rows matching optional filters.
   */
  async count(filters?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({
      where: filters,
    });
  }

  /**
   * Check if a row exists.
   */
  async exists(filters: FindOptionsWhere<T>): Promise<boolean> {
    const c = await this.count(filters);
    return c > 0;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private handleError(error: any): never {
    this.logger.error(`DB error: ${error.message}`);

    // Postgres error codes
    if (error.code === '23505') {
      throw new HttpException('Record already exists', HttpStatus.CONFLICT);
    }
    if (error.code === '23503') {
      throw new HttpException(
        'Foreign key constraint violation',
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      error.message || 'Database error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
