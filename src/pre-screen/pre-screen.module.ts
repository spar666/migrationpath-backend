import { Module } from '@nestjs/common';
import { PreScreenService } from './pre-screen.service';
import { PreScreenController } from './pre-screen.controller';
import { ProspectModule } from '../prospect/prospect.module';
import { EmployerSponsoredModule } from '../employer-sponsored/employer-sponsored.module';
import { OccupationsModule } from '../occupations/occupations.module';

/**
 * The questionnaire runtime. Owns no data of its own — it orchestrates the
 * engine and the two modules that do.
 *
 * Registering this module is enough to bring the employer-sponsored module
 * along with it, which is why app.module.ts only names PreScreenModule.
 */
@Module({
  imports: [ProspectModule, EmployerSponsoredModule, OccupationsModule],
  controllers: [PreScreenController],
  providers: [PreScreenService],
  exports: [PreScreenService],
})
export class PreScreenModule {}
