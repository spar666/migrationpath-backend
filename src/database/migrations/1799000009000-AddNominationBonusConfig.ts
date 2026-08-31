import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Nomination points for 190 and 491, as admin-editable config.
 *
 * The calculator scores the applicant's own attributes. 190 and 491 then add a
 * nomination on top — 5 for state/territory nomination, 15 for regional
 * nomination or eligible family sponsorship. The capture step needs those to
 * report what someone actually stands at per subclass.
 *
 * They live in `policy_config` rather than a constant for the same reason the
 * rest of the points test does: these are legislated figures, and the owner
 * should be able to correct them without a deploy.
 *
 * 189 gets no row — it is scored on the applicant's points alone, and a
 * "bonus of 0" would imply there is a lever there to pull.
 */
export class AddNominationBonusConfig1799000009000
  implements MigrationInterface
{
  name = 'AddNominationBonusConfig1799000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "policy_config"
        ("config_key", "numeric_value", "label", "description",
         "category", "unit", "source_note", "effective_date")
      VALUES
        ('points.stateNominationBonus', 5,
         'State Nomination Points (190)',
         'Points added by state or territory nomination for subclass 190.',
         'points', 'points',
         'Migration Regulations 1994, Schedule 6D. General information only, not migration advice.',
         DATE '2024-11-16'),
        ('points.regionalNominationBonus', 15,
         'Regional Nomination Points (491)',
         'Points added by regional nomination or eligible family sponsorship for subclass 491.',
         'points', 'points',
         'Migration Regulations 1994, Schedule 6D. General information only, not migration advice.',
         DATE '2024-11-16')
      ON CONFLICT ("config_key") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "policy_config"
      WHERE "config_key" IN (
        'points.stateNominationBonus',
        'points.regionalNominationBonus'
      );
    `);
  }
}
