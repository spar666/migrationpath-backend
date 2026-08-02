import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { Nomination } from './entities/nomination.entity';
import { SponsorRepository } from './sponsor.repository';
import { NominationRepository } from './nomination.repository';
import { EmployerSponsoredEngine } from './employer-sponsored.engine';

/**
 * The employer-sponsored domain: the two-party data model (sponsor +
 * nomination) and the eligibility engine that reads it.
 *
 * Deliberately has no dependency on ProspectModule so the dependency arrow
 * only ever points one way (prospect -> employer-sponsored). The engine takes
 * plain fact objects, not prospect rows.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, Nomination])],
  providers: [SponsorRepository, NominationRepository, EmployerSponsoredEngine],
  exports: [
    SponsorRepository,
    NominationRepository,
    EmployerSponsoredEngine,
    TypeOrmModule,
  ],
})
export class EmployerSponsoredModule {}
