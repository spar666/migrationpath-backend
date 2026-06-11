import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import {
  ConsultationQuestionnaireRepository,
  ConsultationBookingRepository,
} from './consultation.repository';
import {
  ConsultationQuestionnaire,
  ConsultationBooking,
} from './entities/consultation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConsultationQuestionnaire, ConsultationBooking]),
  ],
  controllers: [ConsultationController],
  providers: [
    ConsultationService,
    ConsultationQuestionnaireRepository,
    ConsultationBookingRepository,
  ],
  exports: [
    ConsultationService,
    ConsultationQuestionnaireRepository,
    ConsultationBookingRepository,
  ],
})
export class ConsultationModule {}
