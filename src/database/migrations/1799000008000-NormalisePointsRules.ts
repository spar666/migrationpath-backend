import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes `points_rules` the single source of truth for the calculator.
 *
 * Two things were wrong, neither of them the hardcoding people assumed:
 *
 * 1. The "Points Configuration" admin screen read and wrote `points_config`,
 *    a table no calculation has ever consulted. PointsAggregatorService has
 *    always scored against `points_rules`. So edits landed in a table nothing
 *    read, which is why the screen looked disconnected while the calculator
 *    kept returning sensible numbers. Fixed in code (PointsEngineService now
 *    operates on `points_rules`); this migration deals with the data left over.
 *
 * 2. `points_rules` accumulated two rows from manual experimentation that the
 *    calculator can never match, because it compares `category` against the
 *    PointsCategory enum ('AGE', 'ENGLISH', …):
 *
 *      - category 'age'       — lowercase, and min_value 32 > max_value 25,
 *                               so the range test could not pass either
 *      - category 'Education' — not a member of the enum at all
 *
 *    They were invisible to scoring but will now be visible in the admin list,
 *    where they would read as real settings. Removed.
 *
 * The legislated GSM values themselves are already correct and are left alone:
 * age 18-24/25-32/33-39/40-44/45+ = 25/30/25/15/0, English 0/10/20,
 * qualifications 20/15/10/10, and both work-experience ladders.
 *
 * `points_config` is retired but NOT dropped — its two rows are preserved in
 * case anyone wants to see what was typed there. Nothing maps or reads it.
 */
export class NormalisePointsRules1799000008000 implements MigrationInterface {
  name = 'NormalisePointsRules1799000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Unreachable rows: category is compared against the PointsCategory enum,
    // so anything outside it can never match regardless of its other columns.
    await queryRunner.query(`
      DELETE FROM "points_rules"
      WHERE "category" NOT IN (
        'AGE', 'ENGLISH', 'OVERSEAS_WORK',
        'AUSTRALIAN_WORK', 'QUALIFICATIONS', 'REGIONAL_STUDY'
      );
    `);

    // A range rule with min > max can never match. None should exist after the
    // delete above, but this guards the class of defect rather than the row.
    await queryRunner.query(`
      UPDATE "points_rules"
      SET "is_active" = false
      WHERE "min_value" IS NOT NULL
        AND "max_value" IS NOT NULL
        AND "min_value" > "max_value";
    `);

    // Provenance for the "current as of {date}" line the calculator shows.
    // Editable by an admin afterwards through the policy-config screen.
    await queryRunner.query(`
      UPDATE "policy_config"
      SET "effective_date" = DATE '2024-11-16',
          "source_note" = COALESCE(
            "source_note",
            'Migration Regulations 1994, Schedule 6D. General information only, not migration advice.'
          )
      WHERE "category" = 'points' AND "effective_date" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The deleted rows were invalid data, not schema — there is nothing
    // meaningful to restore. Only the provenance stamp is reversible.
    await queryRunner.query(`
      UPDATE "policy_config"
      SET "effective_date" = NULL
      WHERE "category" = 'points' AND "effective_date" = DATE '2024-11-16';
    `);
  }
}
