"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMigrationRules1785000001000 = void 0;
class CreateMigrationRules1785000001000 {
    name = 'CreateMigrationRules1785000001000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "migration_rules" (
        "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "persona_type" character varying NOT NULL,
        "document_name" character varying NOT NULL,
        "description" text,
        "is_mandatory" boolean DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_migration_rules_persona_type" ON "migration_rules" ("persona_type");`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_migration_rules_persona_type";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "migration_rules";`);
    }
}
exports.CreateMigrationRules1785000001000 = CreateMigrationRules1785000001000;
//# sourceMappingURL=1785000001000-CreateMigrationRules.js.map