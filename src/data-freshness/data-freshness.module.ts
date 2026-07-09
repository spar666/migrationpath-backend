import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceMeta } from './entities/data-source-meta.entity';
import { DataFreshnessService } from './data-freshness.service';
import { DataFreshnessController } from './data-freshness.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceMeta])],
  controllers: [DataFreshnessController],
  providers: [DataFreshnessService],
  exports: [DataFreshnessService],
})
export class DataFreshnessModule {}
