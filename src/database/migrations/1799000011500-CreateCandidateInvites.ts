import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandidateInvites1799000011500 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE TABLE "candidate_invites" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "business_prospect_id" uuid NOT NULL REFERENCES "prospects"("id") ON DELETE CASCADE, "candidate_name" varchar(160) NOT NULL, "candidate_email" varchar(160) NOT NULL, "candidate_nationality" varchar(100), "token_hash" varchar(64) NOT NULL UNIQUE, "status" varchar(20) NOT NULL DEFAULT 'pending', "expires_at" timestamptz NOT NULL, "applicant_prospect_id" uuid REFERENCES "prospects"("id") ON DELETE SET NULL, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE INDEX "idx_candidate_invites_business" ON "candidate_invites"("business_prospect_id")`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "candidate_invites"`);
  }
}
