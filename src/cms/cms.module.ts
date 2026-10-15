import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { CmsPublishController } from './cms-publish.controller';

@Module({
  controllers: [CmsController, CmsPublishController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
