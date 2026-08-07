import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './payment.repository';
import { PaymentsService } from './payments.service';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { PaymentsController } from './payments.controller';
import { ProspectModule } from '../prospect/prospect.module';
import { ConsultationModule } from '../consultation/consultation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ProspectModule,
    ConsultationModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentRepository, PaymentsService, PaymentReconciliationService],
  exports: [PaymentRepository, PaymentsService, PaymentReconciliationService],
})
export class PaymentsModule {}
