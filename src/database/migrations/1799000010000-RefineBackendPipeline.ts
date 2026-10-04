import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Expand/backfill phase of CRM consolidation.
 *
 * This migration deliberately does not drop `leads`, `points_config`, or the
 * legacy occupation-list column. Destructive contract work belongs in a later
 * release, after the replacement readers/writers and reconciliation reports
 * have been verified against production-shaped data.
 */
export class RefineBackendPipeline1799000010000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE prospects
      ADD COLUMN best_fit_pathway varchar,
      ADD COLUMN outcome_tag varchar,
      ADD COLUMN gap_codes jsonb NOT NULL DEFAULT '[]',
      ADD COLUMN captured_answers jsonb`);
    // Keep the complete old row in the prospect record; never fabricate consent.
    // Only merge calculator/partner duplicates with an explicitly embedded reference.
    await q.query(`UPDATE prospects p SET captured_answers = COALESCE(p.captured_answers, '{}'::jsonb) ||
      jsonb_build_object('legacy_leads', (SELECT jsonb_agg(to_jsonb(l)) FROM leads l
        WHERE l.source = 'points_calculator' AND l.message LIKE '%Prospect: ' || p.human_ref || '%'))
      WHERE EXISTS (SELECT 1 FROM leads l WHERE l.source = 'points_calculator' AND l.message LIKE '%Prospect: ' || p.human_ref || '%')`);
    await q.query(`INSERT INTO prospects (id, human_ref, full_name, email, phone, source, visa_interest,
      stage, consent_given, outcome_tag, gap_codes, captured_answers, created_at, updated_at)
      SELECT l.id, 'MP-L' || upper(substr(replace(l.id::text, '-', ''), 1, 12)), l.full_name, lower(l.email), l.phone,
        l.source, l.visa_type,
        CASE l.status::text WHEN 'converted' THEN 'engaged' WHEN 'archived' THEN 'disqualified' ELSE 'captured' END,
        false, 'legacy_consent_review', '["consent_not_recorded"]'::jsonb, jsonb_build_object('legacy_lead', to_jsonb(l)), l.created_at, l.updated_at
      FROM leads l WHERE NOT EXISTS (SELECT 1 FROM prospects p WHERE
        l.source = 'points_calculator' AND l.message LIKE '%Prospect: ' || p.human_ref || '%')`);
    await q.query(`CREATE TABLE occupation_list_memberships (
      occupation_code varchar(6) REFERENCES occupations_list(anzsco_code) ON DELETE CASCADE,
      list_code varchar NOT NULL, source_note text, effective_date date,
      PRIMARY KEY (occupation_code, list_code))`);
    await q.query(`INSERT INTO occupation_list_memberships (occupation_code, list_code)
      SELECT anzsco_code, primary_list::text FROM occupations_list WHERE primary_list IS NOT NULL`);
    await q.query(`CREATE TABLE commercial_config (config_key varchar PRIMARY KEY, numeric_value double precision NOT NULL,
      label varchar NOT NULL, updated_at timestamp NOT NULL DEFAULT now())`);
    for (const [key, value] of Object.entries({ minSalaryOfInterest: 70000, hardAgeCeiling: 50, requireAbnForBusiness: 1,
      'service.482-core': 1, 'service.482-specialist': 1, 'service.186-de': 1, 'service.186-trt': 1, 'service.494-es': 1 })) {
      await q.query(`INSERT INTO commercial_config(config_key,numeric_value,label) VALUES($1,$2,$1)`, [key, value]);
    }
    // Draft values intentionally have no effective date: the engine requires RMA verification.
    const policy: Record<string, number> = {
      'employer.coreSkillsIncome': 73150, 'employer.specialistIncome': 135000, 'employer.maxAge': 45,
      'employer.deMinExperienceYears': 3, 'employer.trtMinSponsoredYears': 2,
      'employer.coreMinExperienceYears': 1, 'employer.regionalMinExperienceYears': 3,
      'points.gsmMaxAge': 45,
      'points.gsmPassMark': 65,
      'points.combinedWorkCap': 20,
    };
    for (const stream of ['482-core','482-specialist','186-de','186-trt','494-es']) {
      policy[`employer.${stream}.englishOverall`] = stream.startsWith('482') ? 5 : 6;
      policy[`employer.${stream}.englishPerBand`] = stream.startsWith('482') ? 5 : 6;
    }
    for (const [key, value] of Object.entries(policy)) {
      await q.query(`INSERT INTO policy_config(config_key,numeric_value,label,category,source_note)
        VALUES($1,$2,$1,$3,'Draft only; RMA must verify and record an effective date') ON CONFLICT(config_key) DO NOTHING`, [key,value,key.split('.')[0]]);
    }
    const rubric: [string,string,number][] = [
      ['AUSTRALIAN_STUDY','standard',5], ['SPECIALIST_EDUCATION','stem_research',10],
      ['PROFESSIONAL_YEAR','standard',5], ['COMMUNITY_LANGUAGE','ccl',5],
      ['PARTNER_SKILLS','single_spouse',10], ['PARTNER_SKILLS','skills_english',10],
      ['PARTNER_SKILLS','english_only',5], ['PARTNER_SKILLS','none',0],
    ];
    for (const [category, label, points] of rubric) {
      await q.query(`INSERT INTO points_rules(visa_group,category,attribute_label,points_value,is_active)
        SELECT 'GSM',$1::varchar,$2::varchar,$3::integer,true WHERE NOT EXISTS(SELECT 1 FROM points_rules WHERE visa_group='GSM' AND category=$1::varchar AND attribute_label=$2::varchar)`, [category,label,points]);
    }
  }
  async down(): Promise<void> {
    throw new Error('CRM consolidation cannot be reversed safely after new captures. Restore the pre-deployment backup.');
  }
}
