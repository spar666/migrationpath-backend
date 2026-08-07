import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentRepository } from './payment.repository';
import { PaymentsService } from './payments.service';
export declare class PaymentReconciliationService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly paymentRepository;
    private readonly paymentsService;
    private readonly logger;
    private timer?;
    private running;
    constructor(configService: ConfigService, paymentRepository: PaymentRepository, paymentsService: PaymentsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    reconcile(): Promise<{
        checked: number;
        recovered: number;
        expired: number;
    }>;
}
