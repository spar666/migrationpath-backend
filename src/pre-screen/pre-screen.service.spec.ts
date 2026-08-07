import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PreScreenService } from './pre-screen.service';
import { EmployerSponsoredEngine } from '../employer-sponsored/employer-sponsored.engine';
import { ProspectService } from '../prospect/prospect.service';
import { ProspectSummaryService } from '../prospect/prospect-summary.service';
import { SponsorRepository } from '../employer-sponsored/sponsor.repository';
import { NominationRepository } from '../employer-sponsored/nomination.repository';
import { OccupationsService } from '../occupations/occupations.service';

/**
 * The native questionnaire runtime.
 *
 * This is the only place the eligibility engine meets a stranger's input, and
 * the only place consent is enforced before personal data is written. It also
 * owns a distinction that matters commercially: "we assessed you and the
 * answer is no" versus "we could not assess you because the form was
 * incomplete". Conflating those loses leads who were never actually screened.
 */

const CONTACT = {
  full_name: 'Ada Lovelace',
  email: 'ada@example.com',
  consent_given: true,
  consent_text: 'the exact notice shown',
};

function engineResult(overrides: Record<string, unknown> = {}) {
  return {
    statutory_eligible: true,
    client_fit: true,
    recommended_subclass: '482',
    recommended_label: 'Skills in Demand',
    reasons: ['Occupation is listed'],
    blockers: [],
    open_questions: [],
    ...overrides,
  };
}

describe('PreScreenService.submit', () => {
  let service: PreScreenService;
  let engine: { assess: jest.Mock; setOccupationListCheck: jest.Mock };
  let occupations: { isOnAnyList: jest.Mock };
  let prospects: { create: jest.Mock; linkSponsor: jest.Mock };
  let summaries: { refresh: jest.Mock };
  let sponsors: { create: jest.Mock; save: jest.Mock };
  let nominations: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    engine = {
      assess: jest.fn().mockResolvedValue(engineResult()),
      setOccupationListCheck: jest.fn(),
    };
    occupations = { isOnAnyList: jest.fn().mockResolvedValue(true) };
    prospects = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'prospect-1', human_ref: 'MP-7F3K9A' }),
      linkSponsor: jest.fn().mockResolvedValue({}),
    };
    summaries = { refresh: jest.fn().mockResolvedValue({}) };
    sponsors = {
      create: jest.fn().mockResolvedValue({ id: 'sponsor-1' }),
      save: jest.fn().mockResolvedValue({ id: 'sponsor-1' }),
    };
    nominations = {
      create: jest.fn().mockResolvedValue({ id: 'nomination-1' }),
      save: jest.fn().mockResolvedValue({ id: 'nomination-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreScreenService,
        { provide: EmployerSponsoredEngine, useValue: engine },
        { provide: ProspectService, useValue: prospects },
        { provide: ProspectSummaryService, useValue: summaries },
        { provide: OccupationsService, useValue: occupations },
        { provide: SponsorRepository, useValue: sponsors },
        { provide: NominationRepository, useValue: nominations },
      ],
    }).compile();

    service = module.get<PreScreenService>(PreScreenService);
  });

  const applicantDto = {
    party: 'applicant',
    contact: CONTACT,
    applicant: { age: 32, occupation_name: 'Software Engineer' },
  } as never;

  describe('consent', () => {
    it('refuses to write anything without it', async () => {
      // Storing consent_given=false would mean holding personal information we
      // were not given permission to collect.
      await expect(
        service.submit({
          party: 'applicant',
          contact: { ...CONTACT, consent_given: false },
          applicant: {},
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prospects.create).not.toHaveBeenCalled();
      expect(engine.assess).not.toHaveBeenCalled();
    });

    it('refuses when the contact block is missing entirely', async () => {
      await expect(
        service.submit({ party: 'applicant', applicant: {} } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('stores the notice wording verbatim against the record', async () => {
      await service.submit(applicantDto);
      expect(prospects.create.mock.calls[0][0]).toMatchObject({
        consent_given: true,
        consent_text: 'the exact notice shown',
      });
      expect(prospects.create.mock.calls[0][0].consent_at).toBeInstanceOf(Date);
    });
  });

  describe('ordering', () => {
    it('runs the engine BEFORE writing the prospect', async () => {
      // If the rules throw we would rather fail the request than store a
      // prospect with null flags that silently never gets screened.
      const order: string[] = [];
      engine.assess.mockImplementation(async () => {
        order.push('engine');
        return engineResult();
      });
      prospects.create.mockImplementation(async () => {
        order.push('prospect');
        return { id: 'prospect-1', human_ref: 'MP-1' };
      });

      await service.submit(applicantDto);
      expect(order).toEqual(['engine', 'prospect']);
    });

    it('writes no prospect when the engine throws', async () => {
      engine.assess.mockRejectedValue(new Error('rules exploded'));
      await expect(service.submit(applicantDto)).rejects.toThrow();
      expect(prospects.create).not.toHaveBeenCalled();
    });
  });

  describe('payload shape validation', () => {
    it('rejects an applicant submission with no applicant block', async () => {
      await expect(
        service.submit({ party: 'applicant', contact: CONTACT } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a business submission with no business block', async () => {
      await expect(
        service.submit({ party: 'business', contact: CONTACT } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('flattens a business payload into the engine’s three fact objects', async () => {
      await service.submit({
        party: 'business',
        contact: CONTACT,
        business: {
          sponsor: { legal_name: 'Acme Pty Ltd' },
          nomination: { occupation_name: 'Chef', annual_salary: 78000 },
          candidate: { age: 29 },
        },
      } as never);

      expect(engine.assess).toHaveBeenCalledWith(
        expect.objectContaining({
          party: 'business',
          sponsor: { legal_name: 'Acme Pty Ltd' },
          nomination: expect.objectContaining({ occupation_name: 'Chef' }),
          applicant: { age: 29 },
        }),
      );
    });
  });

  describe('the persisted prospect', () => {
    it('carries both gate flags from the engine', async () => {
      engine.assess.mockResolvedValue(
        engineResult({ statutory_eligible: true, client_fit: false }),
      );
      await service.submit(applicantDto);

      expect(prospects.create.mock.calls[0][0]).toMatchObject({
        statutory_eligible: true,
        client_fit: false,
        stage: 'pre_screened',
      });
    });

    it('is written even for an ineligible person', async () => {
      // An ineligible person is still a lead worth keeping.
      engine.assess.mockResolvedValue(
        engineResult({ statutory_eligible: false, client_fit: false }),
      );
      await service.submit(applicantDto);
      expect(prospects.create).toHaveBeenCalled();
    });
  });

  describe('sponsorship persistence is best-effort', () => {
    it('does not fail the submission when it throws', async () => {
      // We still have the prospect and the engine result; the agent can
      // rebuild the detail from raw_answers on the call.
      sponsors.save.mockRejectedValue(new Error('db down'));
      sponsors.create.mockRejectedValue(new Error('db down'));

      const result = await service.submit({
        party: 'business',
        contact: CONTACT,
        business: { sponsor: { legal_name: 'Acme' }, nomination: {} },
      } as never);

      expect(result.human_ref).toBe('MP-7F3K9A');
    });
  });

  describe('the agent summary', () => {
    it('always receives the raw answers', async () => {
      await service.submit({
        ...(applicantDto as object),
        raw_answers: { q1: 'a1' },
      } as never);

      expect(summaries.refresh).toHaveBeenCalledWith(
        'prospect-1',
        expect.objectContaining({ answers: { q1: 'a1' } }),
      );
    });

    it('falls back to a reconstruction when raw answers are absent', async () => {
      // Never leave the agent with nothing to read on the call.
      await service.submit(applicantDto);
      const patch = summaries.refresh.mock.calls[0][1];
      expect(patch.answers).toBeDefined();
      expect(patch.engine_result).toBeDefined();
    });
  });

  describe('the live result', () => {
    it('lets an eligible, good-fit person book', async () => {
      const result = await service.submit(applicantDto);
      expect(result.can_book).toBe(true);
      expect(result.human_ref).toBe('MP-7F3K9A');
      expect(result.prospect_id).toBe('prospect-1');
    });

    it('withholds booking from someone eligible but not a fit', async () => {
      engine.assess.mockResolvedValue(
        engineResult({ statutory_eligible: true, client_fit: false }),
      );
      const result = await service.submit(applicantDto);

      expect(result.can_book).toBe(false);
      expect(result.next_steps.join(' ')).toMatch(
        /outside what we currently take on/i,
      );
    });

    it('withholds booking from someone ineligible', async () => {
      engine.assess.mockResolvedValue(
        engineResult({
          statutory_eligible: false,
          client_fit: true,
          blockers: ['Occupation not listed'],
        }),
      );
      const result = await service.submit(applicantDto);
      expect(result.can_book).toBe(false);
    });

    it('says "incomplete" rather than "not eligible" when nothing actually failed', async () => {
      // Telling someone they are ineligible when the form was merely too
      // sparse to decide on is false, and loses a lead who was never assessed.
      engine.assess.mockResolvedValue(
        engineResult({
          statutory_eligible: false,
          client_fit: false,
          blockers: [],
          open_questions: ['We still need your English score'],
        }),
      );

      const result = await service.submit(applicantDto);
      const steps = result.next_steps.join(' ');

      expect(steps).toMatch(/could not complete your assessment/i);
      expect(steps).not.toMatch(/not open to you/i);
    });

    it('passes the engine’s reasons and blockers straight through', async () => {
      engine.assess.mockResolvedValue(
        engineResult({
          statutory_eligible: false,
          reasons: ['Salary clears the threshold'],
          blockers: ['Occupation not listed'],
        }),
      );

      const result = await service.submit(applicantDto);
      expect(result.reasons).toContain('Salary clears the threshold');
      expect(result.blockers).toContain('Occupation not listed');
    });
  });
});
