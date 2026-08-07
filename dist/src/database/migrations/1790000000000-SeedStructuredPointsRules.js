"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedStructuredPointsRules1790000000000 = void 0;
const points_catalogue_1 = require("../../points-engine/constants/points-catalogue");
class SeedStructuredPointsRules1790000000000 {
    name = 'SeedStructuredPointsRules1790000000000';
    async up(queryRunner) {
        await queryRunner.query(`DELETE FROM "points_rules" WHERE "visa_group" = $1 AND "category" = ANY($2)`, [points_catalogue_1.DEFAULT_VISA_GROUP, points_catalogue_1.STRUCTURED_CATEGORY_KEYS]);
        for (const rule of points_catalogue_1.STRUCTURED_POINTS_RULES) {
            await queryRunner.query(`INSERT INTO "points_rules"
           ("visa_group", "category", "sub_category", "attribute_label", "min_value", "max_value", "points_value", "is_active")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`, [
                rule.visaGroup,
                rule.category,
                null,
                rule.attributeLabel,
                rule.minValue,
                rule.maxValue,
                rule.points,
            ]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "points_rules" WHERE "visa_group" = $1 AND "category" = ANY($2)`, [points_catalogue_1.DEFAULT_VISA_GROUP, points_catalogue_1.STRUCTURED_CATEGORY_KEYS]);
    }
}
exports.SeedStructuredPointsRules1790000000000 = SeedStructuredPointsRules1790000000000;
//# sourceMappingURL=1790000000000-SeedStructuredPointsRules.js.map