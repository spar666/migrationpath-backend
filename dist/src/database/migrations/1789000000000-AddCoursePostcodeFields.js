"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCoursePostcodeFields1789000000000 = void 0;
class AddCoursePostcodeFields1789000000000 {
    name = 'AddCoursePostcodeFields1789000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "courses"
        ADD COLUMN IF NOT EXISTS "campus_postcode" character varying(4);
    `);
        await queryRunner.query(`
      ALTER TABLE "courses"
        ADD COLUMN IF NOT EXISTS "regional_category" character varying;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_courses_campus_postcode"
        ON "courses" ("campus_postcode");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_courses_campus_postcode";`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "regional_category";`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "campus_postcode";`);
    }
}
exports.AddCoursePostcodeFields1789000000000 = AddCoursePostcodeFields1789000000000;
//# sourceMappingURL=1789000000000-AddCoursePostcodeFields.js.map