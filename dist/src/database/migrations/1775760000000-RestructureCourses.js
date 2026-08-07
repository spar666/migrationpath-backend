"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestructureCourses1775760000000 = void 0;
class RestructureCourses1775760000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "courses"
            DROP CONSTRAINT IF EXISTS "FK_courses_campuses",
            DROP CONSTRAINT IF EXISTS "FK_courses_universities"
        `);
        await queryRunner.query(`
            ALTER TABLE "courses"
            DROP COLUMN IF EXISTS "campusId",
            DROP COLUMN IF EXISTS "universityId",
            DROP COLUMN IF EXISTS "qualification"
        `);
        await queryRunner.query(`
            ALTER TABLE "courses"
            ADD COLUMN IF NOT EXISTS "university_name" character varying NOT NULL DEFAULT ''
        `);
        const columnsToRename = [
            { target: 'course_title', potentialOld: 'courseTitle' },
            { target: 'anzsco_code', potentialOld: 'anzscoCode' },
            { target: 'anzsco_title', potentialOld: 'anzscoTitle' },
            { target: 'annual_fees', potentialOld: 'annualFees' },
            { target: 'is_regional', potentialOld: 'isRegionalPointsEligible' },
            { target: 'is_active', potentialOld: 'isActive' },
        ];
        for (const col of columnsToRename) {
            const hasTargetColumn = await queryRunner.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='courses' AND column_name='${col.target}'
            `);
            if (hasTargetColumn.length === 0) {
                const existingCols = await queryRunner.query(`
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name='courses' AND LOWER(column_name) = LOWER('${col.potentialOld}')
                `);
                if (existingCols.length > 0) {
                    const actualName = existingCols[0].column_name;
                    await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "${actualName}" TO "${col.target}"`);
                }
            }
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "is_active" TO "isActive"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "is_regional" TO "isRegionalPointsEligible"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "annual_fees" TO "annualFees"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "anzsco_title" TO "anzscoTitle"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "anzsco_code" TO "anzscoCode"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "course_title" TO "courseTitle"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "university_name"`);
        await queryRunner.query(`
            ALTER TABLE "courses"
            ADD COLUMN "universityId" uuid,
            ADD COLUMN "campusId" uuid,
            ADD COLUMN "qualification" character varying
        `);
    }
}
exports.RestructureCourses1775760000000 = RestructureCourses1775760000000;
//# sourceMappingURL=1775760000000-RestructureCourses.js.map