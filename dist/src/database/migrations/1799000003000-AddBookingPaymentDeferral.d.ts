import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddBookingPaymentDeferral1799000003000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
