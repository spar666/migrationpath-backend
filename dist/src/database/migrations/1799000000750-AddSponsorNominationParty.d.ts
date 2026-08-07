import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSponsorNominationParty1799000000750 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
