"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormaliseOccupationCodes1799000002000 = void 0;
class NormaliseOccupationCodes1799000002000 {
    name = 'NormaliseOccupationCodes1799000002000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TEMP TABLE occupation_merge ON COMMIT DROP AS
      SELECT
        o.anzsco_code AS old_code,
        o.id          AS old_id,
        k.anzsco_code AS keep_code,
        k.id          AS keep_id
      FROM "occupations_list" o
      JOIN LATERAL (
        SELECT c.anzsco_code, c.id
        FROM "occupations_list" c
        WHERE btrim(c.anzsco_code) = btrim(o.anzsco_code)
        ORDER BY (c.anzsco_code = btrim(c.anzsco_code)) DESC, c.created_at ASC
        LIMIT 1
      ) k ON TRUE
      WHERE o.anzsco_code IS DISTINCT FROM k.anzsco_code;
    `);
        await queryRunner.query(`
      UPDATE "occupation_visas" v
      SET "occupation_anzsco_code" = m.keep_code
      FROM occupation_merge m
      WHERE v."occupation_anzsco_code" = m.old_code
        AND NOT EXISTS (
          SELECT 1 FROM "occupation_visas" x
          WHERE x."occupation_anzsco_code" = m.keep_code
            AND x."visa_id" = v."visa_id"
        );
    `);
        await queryRunner.query(`
      DELETE FROM "occupation_visas" v
      USING occupation_merge m
      WHERE v."occupation_anzsco_code" = m.old_code;
    `);
        await queryRunner.query(`
      UPDATE "occupation_thresholds" t
      SET "occupation_id" = m.keep_id
      FROM occupation_merge m
      WHERE t."occupation_id" = m.old_id
        AND NOT EXISTS (
          SELECT 1 FROM "occupation_thresholds" x
          WHERE x."occupation_id" = m.keep_id
            AND x."state_code" = t."state_code"
        );
    `);
        await queryRunner.query(`
      DELETE FROM "occupation_thresholds" t
      USING occupation_merge m
      WHERE t."occupation_id" = m.old_id;
    `);
        await queryRunner.query(`
      DELETE FROM "occupations_list" o
      USING occupation_merge m
      WHERE o."anzsco_code" = m.old_code;
    `);
        await queryRunner.query(`
      UPDATE "courses" SET "anzsco_code" = btrim("anzsco_code")
      WHERE "anzsco_code" IS NOT NULL AND "anzsco_code" <> btrim("anzsco_code");
    `);
        await queryRunner.query(`
      UPDATE "nominations" SET "occupation_code" = btrim("occupation_code")
      WHERE "occupation_code" IS NOT NULL
        AND "occupation_code" <> btrim("occupation_code");
    `);
        await queryRunner.query(`
      UPDATE "occupations_list"
      SET "anzsco_code" = btrim("anzsco_code"),
          "occupation_name" = btrim("occupation_name")
      WHERE "anzsco_code" <> btrim("anzsco_code")
         OR "occupation_name" <> btrim("occupation_name");
    `);
        await queryRunner.query(`
      ALTER TABLE "occupations_list"
      ADD CONSTRAINT "CHK_occupations_anzsco_trimmed"
      CHECK ("anzsco_code" = btrim("anzsco_code"));
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "occupations_list"
      DROP CONSTRAINT IF EXISTS "CHK_occupations_anzsco_trimmed";
    `);
    }
}
exports.NormaliseOccupationCodes1799000002000 = NormaliseOccupationCodes1799000002000;
//# sourceMappingURL=1799000002000-NormaliseOccupationCodes.js.map