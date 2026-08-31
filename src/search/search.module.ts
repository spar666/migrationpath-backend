import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { IntentService } from './intent.service';
import { OccupationsModule } from '../occupations/occupations.module';

@Module({
  imports: [OccupationsModule],
  controllers: [SearchController],
  providers: [IntentService],
  exports: [IntentService],
})
export class SearchModule {}
