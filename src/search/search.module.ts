import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { IntentService } from './intent.service';
import { Course } from '../courses/entities/course.entity';
import { Invitation } from '../invitation/entities/invitation.entity';
import { OccupationsModule } from '../occupations/occupations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Invitation]),
    // Provides OccupationsService (exported by OccupationsModule) so the intent
    // router can pull split-screen visa data straight from occupation_visas.
    OccupationsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, IntentService],
  exports: [SearchService, IntentService],
})
export class SearchModule {}
