import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateUserProgressTable1779385055809 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
