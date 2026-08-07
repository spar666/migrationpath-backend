import { HttpException, HttpStatus } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

/**
 * The class every repository in the codebase extends.
 *
 * It had no tests, which is backwards: a bug in a leaf repository affects one
 * feature, and a bug here affects all of them at once. The behaviours pinned
 * below are the ones with consequences outside their own call site — what a
 * caller sees when a row is missing, what an anonymous client learns from a
 * database failure, and whether an untrusted sort column can reach the query
 * builder.
 */

interface Widget extends ObjectLiteral {
  id: string;
  name: string;
  created_at: Date;
}

class WidgetRepository extends BaseRepository<Widget> {}

function pgError(code: string) {
  return Object.assign(new Error('duplicate key value violates constraint'), {
    code,
    detail: 'Key (email)=(ada@example.com) already exists.',
  });
}

describe('BaseRepository', () => {
  let repo: WidgetRepository;
  /**
   * Hand-rolled rather than `jest.Mocked<Repository>`: TypeORM's overloads make
   * the generated type awkward to drive, and only these members are exercised.
   */
  interface TypeormStub {
    findOne: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    softDelete: jest.Mock;
    count: jest.Mock;
    metadata: { name: string; columns: { propertyName: string }[] };
  }

  let typeorm: TypeormStub;

  const WIDGET: Widget = {
    id: 'w1',
    name: 'Sprocket',
    created_at: new Date(),
  };

  beforeEach(() => {
    typeorm = {
      findOne: jest.fn().mockResolvedValue(WIDGET),
      find: jest.fn().mockResolvedValue([WIDGET]),
      findAndCount: jest.fn().mockResolvedValue([[WIDGET], 1]),
      create: jest.fn().mockReturnValue(WIDGET),
      save: jest.fn().mockResolvedValue(WIDGET),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(1),
      metadata: {
        name: 'Widget',
        columns: [
          { propertyName: 'id' },
          { propertyName: 'name' },
          { propertyName: 'created_at' },
        ],
      },
    };

    repo = new WidgetRepository(typeorm as unknown as Repository<Widget>);
    jest.spyOn(repo['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(repo['logger'], 'warn').mockImplementation(() => {});
  });

  describe('findById', () => {
    it('404s rather than returning null', async () => {
      // The contract the whole codebase is written against — callers use the
      // result without a null check.
      typeorm.findOne.mockResolvedValue(null);

      await expect(repo.findById('missing')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('update', () => {
    it('writes once instead of read-write-read', async () => {
      // The old implementation issued three queries and left a window between
      // the existence check and the write, in which a concurrent delete turned
      // a no-op into a reported success.
      await repo.update('w1', { name: 'Cog' });

      expect(typeorm.update).toHaveBeenCalledTimes(1);
      // One read afterwards to return the row — not one before as well.
      expect(typeorm.findOne).toHaveBeenCalledTimes(1);
    });

    it('404s when the row was not there', async () => {
      typeorm.update.mockResolvedValue({ affected: 0 });

      await expect(repo.update('gone', { name: 'Cog' })).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('deletes', () => {
    it('404s instead of silently succeeding on a missing row', async () => {
      typeorm.delete.mockResolvedValue({ affected: 0 });

      await expect(repo.hardDelete('gone')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('reports a soft delete of nothing the same way', async () => {
      typeorm.softDelete.mockResolvedValue({ affected: 0 });

      await expect(repo.softDelete('gone')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('paginate', () => {
    it('refuses a sort column that is not on the entity', async () => {
      // Shared code inherited by every repository. No caller forwards user
      // input today, but the first controller to expose `?sortBy=` would have
      // handed it straight to the query builder.
      await repo.paginate(1, 20, undefined, 'name); DROP TABLE widgets;--');

      const [options] = typeorm.findAndCount.mock.calls[0];
      expect(options.order).toEqual({ created_at: 'DESC' });
    });

    it('honours a column that really exists', async () => {
      await repo.paginate(1, 20, undefined, 'name', 'ASC');

      const [options] = typeorm.findAndCount.mock.calls[0];
      expect(options.order).toEqual({ name: 'ASC' });
    });

    it('caps the page size so one request cannot ask for the table', async () => {
      await repo.paginate(1, 100_000);

      const [options] = typeorm.findAndCount.mock.calls[0];
      expect(options.take).toBe(200);
    });

    it('normalises a nonsense page number instead of computing a negative skip', async () => {
      await repo.paginate(-5, 20);

      const [options] = typeorm.findAndCount.mock.calls[0];
      expect(options.skip).toBe(0);
    });
  });

  describe('database errors', () => {
    it('maps a unique violation to 409', async () => {
      typeorm.save.mockRejectedValue(pgError('23505'));

      await expect(repo.create({ name: 'Sprocket' })).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('maps a foreign key violation to 400', async () => {
      typeorm.save.mockRejectedValue(pgError('23503'));

      await expect(repo.create({ name: 'Sprocket' })).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('maps a malformed uuid to 400, not 500', async () => {
      // The caller sent something invalid; we did not break.
      typeorm.update.mockRejectedValue(pgError('22P02'));

      await expect(repo.update('not-a-uuid', {})).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('does NOT leak the driver message to the client', async () => {
      // Postgres detail strings carry column names, constraint names and
      // sometimes row values — here, a customer's email address. These
      // endpoints are anonymous.
      typeorm.save.mockRejectedValue(pgError('99999'));

      await expect(repo.create({ name: 'Sprocket' })).rejects.toMatchObject({
        message: 'Database error',
      });
    });

    it('logs the detail it withholds', async () => {
      // Withheld from the response, not discarded — an engineer still needs it.
      const error = jest.spyOn(repo['logger'], 'error');
      typeorm.save.mockRejectedValue(pgError('99999'));

      await expect(repo.create({ name: 'x' })).rejects.toThrow();
      expect(error).toHaveBeenCalled();
    });

    it('passes our own HttpExceptions through untouched', async () => {
      // Re-wrapping these turned every "not found" on an update into a 500.
      typeorm.update.mockRejectedValue(
        new HttpException('Nope', HttpStatus.FORBIDDEN),
      );

      await expect(repo.update('w1', {})).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });
});
