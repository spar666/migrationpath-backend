import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class NormaliseOccupationCodes1799000002000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
