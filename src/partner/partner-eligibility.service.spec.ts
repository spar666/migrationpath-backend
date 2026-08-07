import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PartnerEligibilityService } from './partner-eligibility.service';
import { PartnerEligibilitySubmission } from './entities/partner-eligibility-submission.entity';
import { PartnerEligibilityEngine } from './partner-eligibility.engine';
import { LeadsService } from '../leads/leads.service';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { PartnerEligibilityDto } from './dto/partner-eligibility.dto';

/**
 * The partner quiz's write path.
 *
 * The engine's verdict is tested exhaustively elsewhere. What matters here is
 * everything AROUND it: this method decides whether a person becomes a
 * prospect, whether they are offered a paid consultation, and what happens to
 * the answers they have just spent fifteen steps giving us when something
 * downstream fails.
 */

const DTO = {
  applicantFirstName: 'Mina',
  sponsorFirstName: 'Tom',
  completedBy: 'Applicant',
  applicantCountry: 'Australia',
  relationshipStatus: 'Married',
  email: 'mina@example.com',
  consent_given: true,
  consent_text: 'I agree that MigrationPath may store the answers I have given',
} as PartnerEligibilityDto;

describe('PartnerEligibilityService.submit', () => {
  let service: PartnerEligibilityService;
  let submissions: { create: jest.Mock; save: jest.Mock };
  let engine: { assess: jest.Mock };
  let leads: { create: jest.Mock };
  let prospects: { create: jest.Mock };
  let summary: { refresh: jest.Mock };

  const verdict = (outcome: string) => ({
    outcome,
    summary: 'Looks straightforward.',
    effort: 'Low Effort',
    highRisk: false,
    becomingEligible: false,
    ineligible: outcome === 'ineligible',
  });

  beforeEach(async () => {
    submissions = {
      create: jest.fn((x: unknown) => x),
      save: jest.fn().mockResolvedValue({
        id: 'sub-1',
        applicantFirstName: 'Mina',
        sponsorFirstName: 'Tom',
      }),
    };
    engine = { assess: jest.fn().mockReturnValue(verdict('eligible')) };
    leads = { create: jest.fn().mockResolvedValue({}) };
    prospects = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'prs-1', human_ref: 'MP-7F3K9A' }),
    };
    summary = { refresh: jest.fn().mockResolvedValue(null) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerEligibilityService,
        {
          provide: getRepositoryToken(PartnerEligibilitySubmission),
          useValue: submissions,
        },
        { provide: PartnerEligibilityEngine, useValue: engine },
        { provide: LeadsService, useValue: leads },
        { provide: ProspectService, useValue: prospects },
        { provide: ProspectSummaryService, useValue: summary },
      ],
    }).compile();

    service = module.get(PartnerEligibilityService);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
  });

  describe('consent', () => {
    it('refuses to store anything without it', async () => {
      // Not "store it with consent_given = false". We should not be holding
      // personal information we were not given permission to collect.
      await expect(
        service.submit({ ...DTO, consent_given: false }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(submissions.save).not.toHaveBeenCalled();
      expect(prospects.create).not.toHaveBeenCalled();
    });

    it('stores the notice text verbatim alongside the flag', async () => {
      // "They agreed" without "to what" is not a record of consent, and the
      // wording changes over time.
      await service.submit(DTO);

      expect(prospects.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consent_given: true,
          consent_text: DTO.consent_text,
          consent_at: expect.any(Date),
        }),
      );
    });
  });

  describe('the prospect', () => {
    it('is created for an ineligible couple too', async () => {
      // They may become eligible, and they are evidence about which pathway
      // the funnel attracts.
      engine.assess.mockReturnValue(verdict('ineligible'));

      await service.submit(DTO);
      expect(prospects.create).toHaveBeenCalled();
    });

    it('leaves client_fit unset rather than guessing it', async () => {
      // Statutory eligibility is a question about the law and the engine
      // answers it. Client fit is a commercial decision this quiz does not ask
      // the questions for — budget, complexity, whether we service the case.
      await service.submit(DTO);

      const created = prospects.create.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(created.client_fit).toBeNull();
      expect(created.statutory_eligible).toBe(true);
    });

    it('records the source so partner leads are distinguishable', async () => {
      // Both funnels produce 'applicant' prospects; only the source separates
      // a partner-visa lead from an employer-sponsored one.
      await service.submit(DTO);

      expect(prospects.create).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'partner_eligibility' }),
      );
    });
  });

  describe('what the client is told', () => {
    it('offers booking to an eligible couple', async () => {
      const result = await service.submit(DTO);

      expect(result.can_book).toBe(true);
      expect(result.prospect_id).toBe('prs-1');
      expect(result.human_ref).toBe('MP-7F3K9A');
    });

    it('does NOT offer booking to an ineligible one', async () => {
      // Selling a consultation to someone we have just told we cannot help is
      // how a migration practice earns complaints.
      engine.assess.mockReturnValue(verdict('ineligible'));

      const result = await service.submit(DTO);
      expect(result.can_book).toBe(false);
    });

    it('still offers booking for a complex case', async () => {
      // high_effort means billable but messy. Turning this cohort away turns
      // paying clients away.
      engine.assess.mockReturnValue(verdict('high_effort'));

      const result = await service.submit(DTO);
      expect(result.can_book).toBe(true);
    });
  });

  describe('when the prospect write fails', () => {
    it('still returns the verdict the visitor is waiting on', async () => {
      // Fifteen steps of answers must not be lost to a database blip.
      prospects.create.mockRejectedValue(new Error('db down'));

      const result = await service.submit(DTO);
      expect(result.outcome).toBe('eligible');
    });

    it('withholds the booking button rather than dead-ending them', async () => {
      // A booking with no prospect behind it cannot be paid for or reconciled,
      // so the CTA would lead somewhere that can only fail.
      prospects.create.mockRejectedValue(new Error('db down'));

      const result = await service.submit(DTO);
      expect(result.can_book).toBe(false);
      expect(result.prospect_id).toBeNull();
    });
  });

  describe('lead capture', () => {
    it('never fails the quiz response', async () => {
      // Notifications are best-effort. The verdict is not.
      leads.create.mockRejectedValue(new Error('smtp down'));

      await expect(service.submit(DTO)).resolves.toMatchObject({
        outcome: 'eligible',
      });
    });
  });
});
