"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserPointsTable1780000000000 = void 0;
class CreateUserPointsTable1780000000000 {
    name = 'CreateUserPointsTable1780000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "user_points" (
        "id"          uuid      NOT NULL DEFAULT gen_random_uuid(),
        "user_id"     uuid      NOT NULL,
        "persona_type" varchar,
        "total_points" integer  NOT NULL DEFAULT 0,
        "breakdown"   jsonb,
        "selections"  jsonb,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_points" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_user_points_user_id" ON "user_points" ("user_id")
    `);
        await queryRunner.query(`
      ALTER TABLE "user_points"
        ADD CONSTRAINT "FK_user_points_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_points" DROP CONSTRAINT "FK_user_points_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_points_user_id"`);
        await queryRunner.query(`DROP TABLE "user_points"`);
    }
}
exports.CreateUserPointsTable1780000000000 = CreateUserPointsTable1780000000000;
//# sourceMappingURL=1780000000000-CreateUserPointsTable.js.map