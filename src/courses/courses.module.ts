import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { PostcodeModule } from '../postcode/postcode.module';
import { OccupationsModule } from '../occupations/occupations.module';

@Module({
  // Lean deps: the course entity, the postcode validator (regional signal), and
  // the occupations master (occupation identity + eligible visas). The
  // Invitation repo and PointsEngineModule are no longer needed here.
  imports: [
    TypeOrmModule.forFeature([Course]),
    PostcodeModule,
    OccupationsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
