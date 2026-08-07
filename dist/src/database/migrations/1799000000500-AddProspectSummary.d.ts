import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddProspectSummary1799000000500 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
