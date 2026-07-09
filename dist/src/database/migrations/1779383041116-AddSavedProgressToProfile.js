"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSavedProgressToProfile1779383041116 = void 0;
class AddSavedProgressToProfile1779383041116 {
    name = 'AddSavedProgressToProfile1779383041116';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "saved_progress" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "saved_progress"`);
    }
}
exports.AddSavedProgressToProfile1779383041116 = AddSavedProgressToProfile1779383041116;
//# sourceMappingURL=1779383041116-AddSavedProgressToProfile.js.map