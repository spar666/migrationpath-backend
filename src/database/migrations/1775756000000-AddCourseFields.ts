import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseFields1775756000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "courses" 
            ADD COLUMN "annualFees" integer,
            ADD COLUMN "isRegionalPointsEligible" boolean NOT NULL DEFAULT false,
            ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "courses" 
            DROP COLUMN "isActive",
            DROP COLUMN "isRegionalPointsEligible",
            DROP COLUMN "annualFees"
        `);
  }
}
