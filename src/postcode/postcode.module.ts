import { Module } from '@nestjs/common';
import { PostcodeValidatorService } from './postcode-validator.service';
import { RegionalPostcodeModule } from '../regional-postcode/regional-postcode.module';

@Module({
  imports: [RegionalPostcodeModule],
  providers: [PostcodeValidatorService],
  exports: [PostcodeValidatorService],
})
export class PostcodeModule {}
