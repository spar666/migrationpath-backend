import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Invitation } from '../invitation/entities/invitation.entity';
import { PointsEngineModule } from '../points-engine/points-engine.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Invitation]), PointsEngineModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
