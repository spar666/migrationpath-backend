"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCourseFields1775756000000 = void 0;
class AddCourseFields1775756000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "courses" 
            ADD COLUMN "annualFees" integer,
            ADD COLUMN "isRegionalPointsEligible" boolean NOT NULL DEFAULT false,
            ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "courses" 
            DROP COLUMN "isActive",
            DROP COLUMN "isRegionalPointsEligible",
            DROP COLUMN "annualFees"
        `);
    }
}
exports.AddCourseFields1775756000000 = AddCourseFields1775756000000;
//# sourceMappingURL=1775756000000-AddCourseFields.js.map