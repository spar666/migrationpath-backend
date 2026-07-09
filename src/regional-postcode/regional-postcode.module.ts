import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionalPostcodeBand } from './entities/regional-postcode-band.entity';
import { RegionalPostcodeService } from './regional-postcode.service';
import { RegionalPostcodeController } from './regional-postcode.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegionalPostcodeBand])],
  controllers: [RegionalPostcodeController],
  providers: [RegionalPostcodeService],
  exports: [RegionalPostcodeService],
})
export class RegionalPostcodeModule {}
