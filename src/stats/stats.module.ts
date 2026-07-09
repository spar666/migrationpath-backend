import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Course } from '../courses/entities/course.entity';
import { Occupation } from '../occupations/entities/occupation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Occupation])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
