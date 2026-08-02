import { randomUUID } from 'crypto';

/**
 * A minimal in-memory stand-in for a TypeORM `Repository<T>`.
 *
 * The point of faking at THIS level rather than higher up: everything above it
 * stays real. The funnel's own repository classes, services, controllers, DTO
 * validation, guards and the eligibility engine all run their actual code. Only
 * the SQL is replaced.
 *
 * That matters because the bugs worth catching in a funnel test are wiring
 * bugs — a module not imported, a DTO that strips a field, a guard on the wrong
 * route, a service reading a property the layer below never sets. Mocking the
 * services away would hide exactly those.
 *
 * It is not a database. It supports the operations this codebase actually
 * performs, and it is deliberately strict about the ones it does not, so an
 * unsupported query fails loudly rather than silently returning nothing.
 */

type Row = Record<string, any>;

function matches(row: Row, where: Row): boolean {
  return Object.entries(where).every(([key, expected]) => {
    // Nested objects in a `where` mean a relation filter, which nothing in the
    // funnel uses. Fail loudly rather than quietly matching everything.
    if (
      expected &&
      typeof expected === 'object' &&
      !(expected instanceof Date)
    ) {
      throw new Error(
        `in-memory repository: unsupported nested where on "${key}". ` +
          `Extend the fake rather than working around it.`,
      );
    }
    return row[key] === expected;
  });
}

function applyOrder(rows: Row[], order?: Row): Row[] {
  if (!order) return rows;
  const [key, direction] = Object.entries(order)[0] ?? [];
  if (!key) return rows;

  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return String(direction).toUpperCase() === 'DESC' ? -cmp : cmp;
  });
}

export interface InMemoryRepository<T = Row> {
  rows: Row[];
  find(options?: { where?: Row; order?: Row; take?: number }): Promise<T[]>;
  findOne(options: { where: Row; order?: Row }): Promise<T | null>;
  findAndCount(options?: {
    where?: Row;
    skip?: number;
    take?: number;
  }): Promise<[T[], number]>;
  count(options?: { where?: Row }): Promise<number>;
  create(data: Partial<T>): T;
  save(entity: Partial<T> | Partial<T>[]): Promise<T>;
  update(criteria: Row | string, data: Row): Promise<{ affected: number }>;
  delete(criteria: Row | string): Promise<{ affected: number }>;
  softDelete(criteria: Row | string): Promise<{ affected: number }>;
  createQueryBuilder(alias?: string): any;
  /** Test helper — seed rows directly. */
  seed(...rows: Partial<T>[]): void;
}

export function createInMemoryRepository<T extends Row = Row>(
  options: {
    /** Column names that must be unique; an insert violating one is ignored. */
    unique?: string[];
  } = {},
): InMemoryRepository<T> {
  const rows: Row[] = [];
  const unique = options.unique ?? [];

  function stamp(row: Row): Row {
    const now = new Date();
    if (!row.id) row.id = randomUUID();
    if (!row.created_at) row.created_at = now;
    row.updated_at = now;
    return row;
  }

  function violatesUnique(candidate: Row, ignore?: Row): string | null {
    for (const column of unique) {
      if (candidate[column] === undefined || candidate[column] === null)
        continue;
      const clash = rows.find(
        (r) => r !== ignore && r[column] === candidate[column],
      );
      if (clash) return column;
    }
    return null;
  }

  const repository: InMemoryRepository<T> = {
    rows,

    async find(opts = {}) {
      let result = opts.where
        ? rows.filter((r) => matches(r, opts.where!))
        : [...rows];
      result = applyOrder(result, opts.order);
      if (opts.take !== undefined) result = result.slice(0, opts.take);
      return result as T[];
    },

    async findOne(opts) {
      const found = applyOrder(
        rows.filter((r) => matches(r, opts.where)),
        opts.order,
      );
      return (found[0] ?? null) as T | null;
    },

    async findAndCount(opts = {}) {
      const filtered = opts.where
        ? rows.filter((r) => matches(r, opts.where!))
        : [...rows];
      const page = filtered.slice(
        opts.skip ?? 0,
        (opts.skip ?? 0) + (opts.take ?? filtered.length),
      );
      return [page as T[], filtered.length];
    },

    async count(opts = {}) {
      return opts.where
        ? rows.filter((r) => matches(r, opts.where!)).length
        : rows.length;
    },

    create(data) {
      return { ...(data as Row) } as T;
    },

    async save(entity) {
      const list = Array.isArray(entity) ? entity : [entity];
      let last: Row | undefined;

      for (const item of list) {
        const existing = (item as Row).id
          ? rows.find((r) => r.id === (item as Row).id)
          : undefined;

        if (existing) {
          Object.assign(existing, item, { updated_at: new Date() });
          last = existing;
        } else {
          const row = stamp({ ...(item as Row) });
          const clash = violatesUnique(row);
          if (clash) {
            // Mirrors a Postgres unique-violation, which the funnel's
            // human_ref generator is written to retry on.
            const error: Error & { code?: string } = new Error(
              `duplicate key value violates unique constraint on "${clash}"`,
            );
            error.code = '23505';
            throw error;
          }
          rows.push(row);
          last = row;
        }
      }

      return last as T;
    },

    /**
     * TypeORM's partial update. BaseRepository.update() calls this and then
     * re-reads the row, so it has to mutate in place rather than replace.
     */
    async update(criteria: Row | string, data: Row) {
      const where = typeof criteria === 'string' ? { id: criteria } : criteria;
      let affected = 0;
      for (const row of rows) {
        if (matches(row, where)) {
          Object.assign(row, data, { updated_at: new Date() });
          affected++;
        }
      }
      return { affected };
    },

    async delete(criteria) {
      const where = typeof criteria === 'string' ? { id: criteria } : criteria;
      const before = rows.length;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (matches(rows[i], where)) rows.splice(i, 1);
      }
      return { affected: before - rows.length };
    },

    async softDelete(criteria) {
      const where = typeof criteria === 'string' ? { id: criteria } : criteria;
      let affected = 0;
      for (const row of rows) {
        if (matches(row, where)) {
          row.deleted_at = new Date();
          affected++;
        }
      }
      return { affected };
    },

    /**
     * Only the insert().orIgnore().returning() shape is supported, because that
     * is the one query the funnel builds by hand — the webhook idempotency
     * claim. Its whole behaviour is "insert unless the unique constraint says
     * we have seen this before", which is what makes replays cheap, so the fake
     * has to honour it exactly.
     */
    createQueryBuilder() {
      let pending: Row[] = [];
      let ignoreConflicts = false;

      const builder: Row = {
        insert: () => builder,
        into: () => builder,
        values: (values: Row | Row[]) => {
          pending = Array.isArray(values) ? values : [values];
          return builder;
        },
        orIgnore: () => {
          ignoreConflicts = true;
          return builder;
        },
        returning: () => builder,
        execute: async () => {
          const inserted: Row[] = [];
          for (const value of pending) {
            const row = stamp({ ...value });
            if (violatesUnique(row)) {
              if (ignoreConflicts) continue; // ON CONFLICT DO NOTHING
              const error: Error & { code?: string } = new Error(
                'duplicate key value violates unique constraint',
              );
              error.code = '23505';
              throw error;
            }
            rows.push(row);
            inserted.push(row);
          }
          return {
            raw: inserted,
            identifiers: inserted.map((r) => ({ id: r.id })),
          };
        },
        // Anything else is unsupported on purpose.
        where: () => {
          throw new Error(
            'in-memory repository: query builder SELECTs are not supported',
          );
        },
      };

      return builder;
    },

    seed(...seeded) {
      for (const row of seeded) rows.push(stamp({ ...(row as Row) }));
    },
  };

  return repository;
}
