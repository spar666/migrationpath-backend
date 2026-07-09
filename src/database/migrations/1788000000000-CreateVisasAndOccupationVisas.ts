import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVisasAndOccupationVisas1788000000000
  implements MigrationInterface
{
  name = 'CreateVisasAndOccupationVisas1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Re-point the occupations_list primary key to anzsco_code.
    //    The surrogate `id` is retained as a UNIQUE column so the existing
    //    occupation_thresholds foreign key (FK_thresholds_occupations ->
    //    occupations_list(id)) keeps working with no data migration.
    //
    //    Must drop the dependent FK first, then re-add it after the PK swap.
    await queryRunner.query(`
      ALTER TABLE "occupation_thresholds"
        DROP CONSTRAINT IF EXISTS "FK_thresholds_occupations";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ALTER COLUMN "anzsco_code" SET NOT NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        DROP CONSTRAINT IF EXISTS "PK_occupations_list";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        DROP CONSTRAINT IF EXISTS "UQ_occupations_list_anzsco";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ADD CONSTRAINT "PK_occupations_list" PRIMARY KEY ("anzsco_code");
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ADD CONSTRAINT "UQ_occupations_list_id" UNIQUE ("id");
    `);
    await queryRunner.query(`
      ALTER TABLE "occupation_thresholds"
        ADD CONSTRAINT "FK_thresholds_occupations"
        FOREIGN KEY ("occupation_id") REFERENCES "occupations_list"("id");
    `);

    // 2. Add the primary_list classifier to occupations.
    await queryRunner.query(`
      CREATE TYPE "occupations_list_primary_list_enum"
        AS ENUM('MLTSSL', 'STSOL', 'ROL', 'CSOL');
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ADD COLUMN "primary_list" "occupations_list_primary_list_enum";
    `);

    // 3. Visa lookup table.
    await queryRunner.query(`
      CREATE TYPE "visas_residency_type_enum"
        AS ENUM('permanent', 'provisional', 'temporary');
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "visas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "subclass_number" character varying(16) NOT NULL,
        "stream_title" character varying NOT NULL,
        "residency_type" "visas_residency_type_enum" NOT NULL,
        "name" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_visas" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_visas_subclass_number"
        ON "visas" ("subclass_number");
    `);

    // 4. Relational junction: occupation (by anzsco_code) <-> visa.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "occupation_visas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "occupation_anzsco_code" character varying(6) NOT NULL,
        "visa_id" uuid NOT NULL,
        "caveats" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_occupation_visas" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_occupation_visa"
          UNIQUE ("occupation_anzsco_code", "visa_id"),
        CONSTRAINT "FK_occupation_visas_occupation"
          FOREIGN KEY ("occupation_anzsco_code")
          REFERENCES "occupations_list"("anzsco_code")
          ON DELETE CASCADE,
        CONSTRAINT "FK_occupation_visas_visa"
          FOREIGN KEY ("visa_id")
          REFERENCES "visas"("id")
          ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_occupation_visas_anzsco"
        ON "occupation_visas" ("occupation_anzsco_code");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_occupation_visas_visa_id"
        ON "occupation_visas" ("visa_id");
    `);

    // 5. Seed the visa catalogue (idempotent on subclass_number).
    await queryRunner.query(`
      INSERT INTO "visas" ("subclass_number", "stream_title", "residency_type", "name") VALUES
        ('189', 'Points-tested', 'permanent', 'Skilled Independent'),
        ('190', 'State/Territory Nominated', 'permanent', 'Skilled Nominated'),
        ('491', 'State/Territory or Family Sponsored', 'provisional', 'Skilled Work Regional (Provisional)'),
        ('485', 'Graduate Work', 'temporary', 'Temporary Graduate'),
        ('494', 'Employer Sponsored', 'provisional', 'Skilled Employer Sponsored Regional (Provisional)'),
        ('482', 'Core Skills', 'temporary', 'Skills in Demand'),
        ('186', 'Direct Entry', 'permanent', 'Employer Nomination Scheme')
      ON CONFLICT ("subclass_number") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order.
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_occupation_visas_visa_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_occupation_visas_anzsco";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "occupation_visas";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_visas_subclass_number";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visas";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "visas_residency_type_enum";`);

    await queryRunner.query(`
      ALTER TABLE "occupations_list" DROP COLUMN IF EXISTS "primary_list";
    `);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "occupations_list_primary_list_enum";`,
    );

    // Restore the original primary key on id and the anzsco unique constraint.
    await queryRunner.query(`
      ALTER TABLE "occupation_thresholds"
        DROP CONSTRAINT IF EXISTS "FK_thresholds_occupations";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        DROP CONSTRAINT IF EXISTS "UQ_occupations_list_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        DROP CONSTRAINT IF EXISTS "PK_occupations_list";
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ADD CONSTRAINT "PK_occupations_list" PRIMARY KEY ("id");
    `);
    await queryRunner.query(`
      ALTER TABLE "occupations_list"
        ADD CONSTRAINT "UQ_occupations_list_anzsco" UNIQUE ("anzsco_code");
    `);
    await queryRunner.query(`
      ALTER TABLE "occupation_thresholds"
        ADD CONSTRAINT "FK_thresholds_occupations"
        FOREIGN KEY ("occupation_id") REFERENCES "occupations_list"("id");
    `);
  }
}
