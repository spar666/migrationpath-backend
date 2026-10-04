import { MigrationInterface, QueryRunner } from 'typeorm';
import { OFFICIAL_OCCUPATIONS } from '../reference-data/official-occupations';

export class ImportOfficialOccupations1799000011000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    for (const row of OFFICIAL_OCCUPATIONS) {
      await q.query(`INSERT INTO occupations_list(anzsco_code,occupation_name) VALUES($1,$2)
        ON CONFLICT(anzsco_code) DO NOTHING`, [row.code,row.title]);
      await q.query(`INSERT INTO occupation_list_memberships(occupation_code,list_code,source_note,effective_date)
        VALUES($1,$2,$3,$4) ON CONFLICT(occupation_code,list_code) DO UPDATE
        SET source_note=EXCLUDED.source_note,effective_date=EXCLUDED.effective_date
        WHERE occupation_list_memberships.effective_date IS NULL OR occupation_list_memberships.effective_date <= EXCLUDED.effective_date`,
        [row.code,row.list,row.source + (row.caveatReferences ? `; Caveat references requiring RMA review: ${row.caveatReferences}` : ''),row.effectiveDate]);
    }
  }
  async down(): Promise<void> {
    throw new Error('Restore the reference-data backup to reverse an official dataset import.');
  }
}
