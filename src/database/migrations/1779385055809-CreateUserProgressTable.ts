import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProgressTable1779385055809 implements MigrationInterface {
  name = 'CreateUserProgressTable1779385055809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the dedicated user_progress table
    await queryRunner.query(`
      CREATE TABLE "user_progress" (
        "id"                uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"           uuid        NOT NULL,
        "title"             varchar,
        "current_step"      varchar     NOT NULL DEFAULT 'search',
        "anzsco_code"       varchar,
        "target_visa"       varchar,
        "calculated_points" integer,
        "data"              jsonb,
        "is_completed"      boolean     NOT NULL DEFAULT false,
        "created_at"        TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_progress" PRIMARY KEY ("id")
      )
    `);

    // 2. Index for fast per-user lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_user_progress_user_id" ON "user_progress" ("user_id")
    `);

    // 3. Foreign key to users — cascade delete keeps db clean
    await queryRunner.query(`
      ALTER TABLE "user_progress"
        ADD CONSTRAINT "FK_user_progress_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 4. Remove the old saved_progress blob from profiles (already applied
    //    by the previous migration, IF EXISTS makes it idempotent)
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP COLUMN IF EXISTS "saved_progress"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore saved_progress on profiles
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "saved_progress" jsonb`,
    );

    // Tear down user_progress table
    await queryRunner.query(
      `ALTER TABLE "user_progress" DROP CONSTRAINT "FK_user_progress_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_progress_user_id"`);
    await queryRunner.query(`DROP TABLE "user_progress"`);
  }
}
