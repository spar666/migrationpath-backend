import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationsService } from './occupations.service';
import { OccupationsController } from './occupations.controller';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Occupation, OccupationThreshold])],
  controllers: [OccupationsController],
  providers: [OccupationsService],
  exports: [OccupationsService],
})
export class OccupationsModule {}
