import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSavedProgressToProfile1779383041116 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
