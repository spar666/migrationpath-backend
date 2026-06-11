import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Course } from '../courses/entities/course.entity';
import { Invitation } from '../invitation/entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Invitation])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
