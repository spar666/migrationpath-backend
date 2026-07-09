import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoursePostcodeFields1789000000000
  implements MigrationInterface
{
  name = 'AddCoursePostcodeFields1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses"
        ADD COLUMN IF NOT EXISTS "campus_postcode" character varying(4);
    `);
    await queryRunner.query(`
      ALTER TABLE "courses"
        ADD COLUMN IF NOT EXISTS "regional_category" character varying;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_courses_campus_postcode"
        ON "courses" ("campus_postcode");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_courses_campus_postcode";`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN IF EXISTS "regional_category";`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN IF EXISTS "campus_postcode";`,
    );
  }
}
