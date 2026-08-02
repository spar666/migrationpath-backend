import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * Builds every entity's TypeORM metadata without touching a database.
 *
 * This exists because `tsc` cannot catch this class of bug. TypeORM infers a
 * column's database type from `design:type`, which `emitDecoratorMetadata`
 * derives from the TypeScript type. A property typed `string | null` emits
 * `Object`, and TypeORM then throws
 *
 *   DataTypeNotSupportedError: Data type "Object" in "Entity.column"
 *   is not supported by "postgres"
 *
 * ...at DataSource init — i.e. at application startup, in whatever environment
 * you deployed to, long after a green build. The fix is always to give the
 * @Column an explicit `type`.
 *
 * Keep this test. It turns a startup crash into a failing unit test.
 */
describe('entity metadata', () => {
  it('builds for every entity without a database connection', async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      // Same glob shape the app and the CLI data-source use.
      entities: [join(__dirname, '..', '**', '*.entity.ts')],
      synchronize: false,
    });

    // buildMetadatas() is the step that validates column types. It does not
    // open a socket, so this runs anywhere.
    await expect(
      (
        dataSource as unknown as { buildMetadatas(): Promise<void> }
      ).buildMetadatas(),
    ).resolves.not.toThrow();

    expect(dataSource.entityMetadatas.length).toBeGreaterThan(0);
  });
});
