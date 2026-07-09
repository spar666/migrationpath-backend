import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationsService } from './occupations.service';
import { OccupationsController } from './occupations.controller';
import { OccupationsAdminController } from './occupations-admin.controller';
import { OccupationListImportService } from './occupation-list-import.service';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { Visa } from './entities/visa.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Occupation,
      OccupationThreshold,
      Visa,
      OccupationVisa,
    ]),
  ],
  controllers: [OccupationsController, OccupationsAdminController],
  providers: [OccupationsService, OccupationListImportService],
  exports: [OccupationsService],
})
export class OccupationsModule {}
