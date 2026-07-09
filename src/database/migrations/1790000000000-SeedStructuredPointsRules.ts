import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  STRUCTURED_POINTS_RULES,
  STRUCTURED_CATEGORY_KEYS,
  DEFAULT_VISA_GROUP,
} from '../../points-engine/constants/points-catalogue';

export class SeedStructuredPointsRules1790000000000
  implements MigrationInterface
{
  name = 'SeedStructuredPointsRules1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: clear any existing structured-category rows for this visa
    // group first, then insert the canonical set from the shared catalogue.
    await queryRunner.query(
      `DELETE FROM "points_rules" WHERE "visa_group" = $1 AND "category" = ANY($2)`,
      [DEFAULT_VISA_GROUP, STRUCTURED_CATEGORY_KEYS],
    );

    for (const rule of STRUCTURED_POINTS_RULES) {
      await queryRunner.query(
        `INSERT INTO "points_rules"
           ("visa_group", "category", "sub_category", "attribute_label", "min_value", "max_value", "points_value", "is_active")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [
          rule.visaGroup,
          rule.category,
          null,
          rule.attributeLabel,
          rule.minValue,
          rule.maxValue,
          rule.points,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "points_rules" WHERE "visa_group" = $1 AND "category" = ANY($2)`,
      [DEFAULT_VISA_GROUP, STRUCTURED_CATEGORY_KEYS],
    );
  }
}
