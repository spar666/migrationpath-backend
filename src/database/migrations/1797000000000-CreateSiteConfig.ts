import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSiteConfig1797000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "site_config" CASCADE;`);

    await queryRunner.query(`
      CREATE TABLE "site_config" (
        "id"          uuid DEFAULT gen_random_uuid() NOT NULL,
        "config_key"  varchar NOT NULL DEFAULT 'site_config',
        "config_data" jsonb NOT NULL DEFAULT '{}',
        "updated_by"  uuid,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_site_config" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_site_config_key"
      ON "site_config" ("config_key");
    `);

    // Seed the default configuration
    await queryRunner.query(`
      INSERT INTO "site_config" ("config_key", "config_data")
      VALUES ('site_config', $1::jsonb)
      ON CONFLICT ("config_key") DO NOTHING;
    `, [JSON.stringify({
      home: {
        heroHeadline: 'Your Pathway to Australian Migration',
        heroSubtext: 'Navigate the 2026 migration landscape with expert-led strategy tools and real-time points optimization.',
        heroImage: '',
        primaryCta: 'Get Started',
        secondaryCta: 'Check My Points',
        outlookTitle: '2026 Migration Outlook',
        outlookDescription: 'Australia is shifting toward a skills-first model. The new Skills in Demand (SID) visa offers a 2-year pathway to PR for eligible professionals.',
        processingTimeHealthcare: '7 Days',
        processingTimeTech: '14 Days',
        benefits: ['MARA Registered Agents', '2026 Priority Lists', 'Real-Time Points Optimizer'],
      },
      student: {
        heroHeadline: 'Study Your Way to Australian PR',
        heroSubtext: 'Strategic course selection that maximizes your points and accelerates your permanent residency pathway.',
        heroImage: '',
        primaryCta: 'Find Your Course',
        secondaryCta: 'Calculate Points',
        benefits: ['Regional Study Bonus', 'Post-Study Work Rights', 'Direct PR Pathways'],
      },
      skilled: {
        heroHeadline: 'Skilled Migration Made Simple',
        heroSubtext: 'Expert guidance for 189, 190, and 491 visa pathways. Real-time state nomination insights.',
        heroImage: '',
        primaryCta: 'Check Eligibility',
        secondaryCta: 'State Requirements',
        benefits: ['EOI Optimization', 'State Priority Matching', 'Skills Assessment Support'],
      },
      partner: {
        heroHeadline: 'Partner Visa Pathways',
        heroSubtext: 'Comprehensive support for partner and prospective marriage visa applications.',
        heroImage: '',
        primaryCta: 'Start Application',
        secondaryCta: 'Evidence Checklist',
        benefits: ['Evidence Planning', 'Timeline Management', 'Relationship Documentation'],
      },
      onshore: {
        heroHeadline: 'Onshore to PR Strategy',
        heroSubtext: 'Transform your temporary visa into permanent residency with our strategic audit and planning tools.',
        heroImage: '',
        primaryCta: 'Get Strategy Audit',
        secondaryCta: 'Calculate My Points',
        benefits: ['Visa Bridge Planning', 'Work Experience Tracking', 'Points Optimization'],
      },
      footer: {
        maraStatement: 'MigrationPath is operated by registered migration agents. MARA Registration: XXXXXX',
        quickLinks: ['Home', 'Points Calculator', 'News', 'Contact'],
        resourceLinks: ['2026 Priority Occupation List', 'State Nomination Requirements', 'Processing Times'],
      },
    })]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_site_config_key";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "site_config";`);
  }
}
