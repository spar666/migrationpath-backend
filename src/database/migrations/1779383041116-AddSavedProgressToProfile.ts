import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSavedProgressToProfile1779383041116 implements MigrationInterface {
  name = 'AddSavedProgressToProfile1779383041116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "saved_progress" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP COLUMN "saved_progress"`,
    );
  }
}
