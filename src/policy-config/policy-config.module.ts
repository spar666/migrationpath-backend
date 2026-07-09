import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyConfig } from './entities/policy-config.entity';
import { PolicyConfigService } from './policy-config.service';
import { PolicyConfigController } from './policy-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyConfig])],
  controllers: [PolicyConfigController],
  providers: [PolicyConfigService],
  exports: [PolicyConfigService],
})
export class PolicyConfigModule {}
