"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeanCourseFields1793000000000 = void 0;
class LeanCourseFields1793000000000 {
    name = 'LeanCourseFields1793000000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "annual_fees";`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "duration";`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "annual_fees" integer NOT NULL DEFAULT 40000;`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "duration" character varying NOT NULL DEFAULT '2 years';`);
    }
}
exports.LeanCourseFields1793000000000 = LeanCourseFields1793000000000;
//# sourceMappingURL=1793000000000-LeanCourseFields.js.map