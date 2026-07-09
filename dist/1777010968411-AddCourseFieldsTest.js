"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCourseFieldsTest1777010968411 = void 0;
class AddCourseFieldsTest1777010968411 {
    name = 'AddCourseFieldsTest1777010968411';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_profiles_users"`);
        await queryRunner.query(`ALTER TABLE "campuses" DROP CONSTRAINT "FK_campuses_universities"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_campuses"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_universities"`);
        await queryRunner.query(`ALTER TABLE "user_quotes" DROP CONSTRAINT "FK_quotes_users"`);
        await queryRunner.query(`ALTER TABLE "user_quotes" DROP CONSTRAINT "FK_quotes_packages"`);
        await queryRunner.query(`ALTER TABLE "occupation_thresholds" DROP CONSTRAINT "FK_thresholds_occupations"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_notifications_users"`);
        await queryRunner.query(`ALTER TABLE "consultation_questionnaire" DROP CONSTRAINT "FK_questionnaire_users"`);
        await queryRunner.query(`ALTER TABLE "consultation_bookings" DROP CONSTRAINT "FK_bookings_users"`);
        await queryRunner.query(`ALTER TABLE "activity_log" DROP CONSTRAINT "FK_activity_log_users"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "annualFees" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "isRegionalPointsEligible" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_8e520eb4da7dc01d0e190447c8e" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campuses" ADD CONSTRAINT "FK_45e7d9f7e4381c88d79e55caad0" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_7a388bd34a218f84a8ba24fd676" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4d3dd55b17bb50e40566e732099" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_quotes" ADD CONSTRAINT "FK_023be6ab3dc6c46515176f76e97" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_quotes" ADD CONSTRAINT "FK_e35f7be86a4e2f080b7a444160c" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "occupation_thresholds" ADD CONSTRAINT "FK_d3ed4695c663f3ad290aee7ce38" FOREIGN KEY ("occupation_id") REFERENCES "occupations_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultation_questionnaire" ADD CONSTRAINT "FK_42a224e0d9262f30de4332fc3e0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultation_bookings" ADD CONSTRAINT "FK_af0153d418d34b0272e673a3878" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_log" ADD CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_log" ADD CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "activity_log" DROP CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6"`);
        await queryRunner.query(`ALTER TABLE "activity_log" DROP CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6"`);
        await queryRunner.query(`ALTER TABLE "consultation_bookings" DROP CONSTRAINT "FK_af0153d418d34b0272e673a3878"`);
        await queryRunner.query(`ALTER TABLE "consultation_questionnaire" DROP CONSTRAINT "FK_42a224e0d9262f30de4332fc3e0"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "occupation_thresholds" DROP CONSTRAINT "FK_d3ed4695c663f3ad290aee7ce38"`);
        await queryRunner.query(`ALTER TABLE "user_quotes" DROP CONSTRAINT "FK_e35f7be86a4e2f080b7a444160c"`);
        await queryRunner.query(`ALTER TABLE "user_quotes" DROP CONSTRAINT "FK_023be6ab3dc6c46515176f76e97"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4d3dd55b17bb50e40566e732099"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_7a388bd34a218f84a8ba24fd676"`);
        await queryRunner.query(`ALTER TABLE "campuses" DROP CONSTRAINT "FK_45e7d9f7e4381c88d79e55caad0"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_8e520eb4da7dc01d0e190447c8e"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "isRegionalPointsEligible"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "annualFees"`);
        await queryRunner.query(`ALTER TABLE "activity_log" ADD CONSTRAINT "FK_activity_log_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultation_bookings" ADD CONSTRAINT "FK_bookings_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultation_questionnaire" ADD CONSTRAINT "FK_questionnaire_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_notifications_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "occupation_thresholds" ADD CONSTRAINT "FK_thresholds_occupations" FOREIGN KEY ("occupation_id") REFERENCES "occupations_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_quotes" ADD CONSTRAINT "FK_quotes_packages" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_quotes" ADD CONSTRAINT "FK_quotes_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_universities" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_campuses" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campuses" ADD CONSTRAINT "FK_campuses_universities" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_users" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.AddCourseFieldsTest1777010968411 = AddCourseFieldsTest1777010968411;
//# sourceMappingURL=1777010968411-AddCourseFieldsTest.js.map