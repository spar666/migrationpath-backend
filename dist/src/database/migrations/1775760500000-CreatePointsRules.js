"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePointsRules1775760500000 = void 0;
class CreatePointsRules1775760500000 {
    name = 'CreatePointsRules1775760500000';
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "points_rules" (
                "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                "visa_group" character varying NOT NULL,
                "category" character varying NOT NULL,
                "sub_category" character varying,
                "attribute_label" character varying,
                "min_value" integer,
                "max_value" integer,
                "points_value" integer NOT NULL,
                "is_active" boolean DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_points_rules_category" ON "points_rules" ("category");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_points_rules_visa_group" ON "points_rules" ("visa_group");`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_points_rules_visa_group";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_points_rules_category";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "points_rules";`);
    }
}
exports.CreatePointsRules1775760500000 = CreatePointsRules1775760500000;
//# sourceMappingURL=1775760500000-CreatePointsRules.js.map