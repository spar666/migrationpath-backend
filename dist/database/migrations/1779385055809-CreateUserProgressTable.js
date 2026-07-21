"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserProgressTable1779385055809 = void 0;
class CreateUserProgressTable1779385055809 {
    name = 'CreateUserProgressTable1779385055809';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "user_progress" (
        "id"                uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"           uuid        NOT NULL,
        "title"             varchar,
        "current_step"      varchar     NOT NULL DEFAULT 'search',
        "anzsco_code"       varchar,
        "target_visa"       varchar,
        "calculated_points" integer,
        "data"              jsonb,
        "is_completed"      boolean     NOT NULL DEFAULT false,
        "created_at"        TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_progress" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_user_progress_user_id" ON "user_progress" ("user_id")
    `);
        await queryRunner.query(`
      ALTER TABLE "user_progress"
        ADD CONSTRAINT "FK_user_progress_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "saved_progress"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "saved_progress" jsonb`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_user_progress_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_progress_user_id"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
    }
}
exports.CreateUserProgressTable1779385055809 = CreateUserProgressTable1779385055809;
//# sourceMappingURL=1779385055809-CreateUserProgressTable.js.map