import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPointsValueAndRemoveUserDocuments1785000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'occupations_list' AND column_name = 'points_value'
        ) THEN
          ALTER TABLE "occupations_list" ADD "points_value" integer NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "user_documents" CASCADE;
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "user_documents_status_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "occupations_list" DROP COLUMN "points_value";
    `);

    await queryRunner.query(`
      CREATE TYPE "user_documents_status_enum" AS ENUM('pending', 'verified', 'rejected');
    `);

    await queryRunner.query(`
      CREATE TABLE "user_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "file_path" character varying NOT NULL,
        "file_type" character varying NOT NULL,
        "status" "user_documents_status_enum" NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        "admin_notes" varchar,
        "reviewed_by" character varying,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_documents_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }
}
