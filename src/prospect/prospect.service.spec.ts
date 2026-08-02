import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProspectService } from './prospect.service';
import { ProspectRepository } from './prospect.repository';
import { ProspectSummaryService } from './prospect-summary.service';
import { ConsultationBookingRepository } from '../consultation/consultation.repository';
import { Prospect } from './entities/prospect.entity';

/**
 * GET /prospects/:id/status is the one unauthenticated read in the funnel.
 *
 * It exists because a prospect returning from Stripe has no token and still
 * needs to know whether their booking confirmed. That makes its access rules
 * worth pinning down precisely: the uuid alone must not be enough, and a
 * wrong reference must not reveal that the id was right.
 */

const PROSPECT: Partial<Prospect> = {
  id: '4f1a5c2e-0000-4000-8000-000000000000',
  human_ref: 'MP-7F3K9A',
  full_name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+61400000000',
  stage: 'pre_screened',
  statutory_eligible: true,
  client_fit: true,
};

describe('ProspectService.getPublicStatus', () => {
  let service: ProspectService;
  let prospects: { findOneById: jest.Mock };
  let bookings: { findLatestForProspect: jest.Mock };

  beforeEach(async () => {
    prospects = { findOneById: jest.fn() };
    bookings = { findLatestForProspect: jest.fn().mockResolvedValue(null) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProspectService,
        { provide: ProspectRepository, useValue: prospects },
        { provide: ProspectSummaryService, useValue: { get: jest.fn() } },
        { provide: ConsultationBookingRepository, useValue: bookings },
      ],
    }).compile();

    service = module.get<ProspectService>(ProspectService);
  });

  describe('the second key', () => {
    it('returns the status when both id and reference match', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.human_ref).toBe('MP-7F3K9A');
    });

    it('rejects a correct id with the wrong reference', async () => {
      // Knowing the uuid is not enough. This is the whole point of the design.
      prospects.findOneById.mockResolvedValue(PROSPECT);
      await expect(
        service.getPublicStatus(PROSPECT.id!, 'MP-WRONG1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects a missing reference', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      await expect(service.getPublicStatus(PROSPECT.id!, '')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFound — never Forbidden — on a mismatch', async () => {
      // A "wrong reference" response would confirm the id exists, which is
      // exactly the signal an enumerator wants.
      prospects.findOneById.mockResolvedValue(PROSPECT);
      await expect(
        service.getPublicStatus(PROSPECT.id!, 'MP-WRONG1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('gives the same error for an unknown id as for a bad reference', async () => {
      prospects.findOneById.mockResolvedValue(null);
      await expect(
        service.getPublicStatus('does-not-exist', 'MP-7F3K9A'),
      ).rejects.toThrow(NotFoundException);
    });

    it('accepts the reference case-insensitively and with stray whitespace', async () => {
      // People retype this off a notepad or paste it out of an email.
      prospects.findOneById.mockResolvedValue(PROSPECT);
      await expect(
        service.getPublicStatus(PROSPECT.id!, '  mp-7f3k9a  '),
      ).resolves.toBeDefined();
    });
  });

  describe('what it discloses', () => {
    it('never returns contact details', async () => {
      // This endpoint is unauthenticated. The prospect knows their own name;
      // anyone who guessed both keys should not learn it.
      prospects.findOneById.mockResolvedValue(PROSPECT);
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      const serialised = JSON.stringify(status);

      expect(serialised).not.toContain('Ada Lovelace');
      expect(serialised).not.toContain('ada@example.com');
      expect(serialised).not.toContain('+61400000000');
    });

    it('does not return the questionnaire or the agent summary', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status).not.toHaveProperty('summary');
      expect(status).not.toHaveProperty('raw_answers');
    });
  });

  describe('confirmation state', () => {
    it('reports unconfirmed while the prospect is only pre-screened', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.consult_confirmed).toBe(false);
    });

    it('reports confirmed once the stage reaches booked', async () => {
      // 'booked' is set only after the fee is paid AND the slot is held, so it
      // is the one signal the confirmation page can trust.
      prospects.findOneById.mockResolvedValue({ ...PROSPECT, stage: 'booked' });
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.consult_confirmed).toBe(true);
    });

    it('does not report confirmed for a held-but-unpaid booking', async () => {
      // An unpaid booking is the agent's follow-up queue, not a confirmation.
      prospects.findOneById.mockResolvedValue(PROSPECT);
      bookings.findLatestForProspect.mockResolvedValue({
        id: 'b1',
        status: 'pending',
        scheduled_at: new Date('2026-08-01T02:00:00Z'),
      });

      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.consult_confirmed).toBe(false);
      expect(status.booking?.status).toBe('pending');
    });
  });

  describe('booking payload', () => {
    it('returns null when no slot has been taken yet', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.booking).toBeNull();
    });

    it('passes through the scheduler links the prospect needs', async () => {
      prospects.findOneById.mockResolvedValue({ ...PROSPECT, stage: 'booked' });
      bookings.findLatestForProspect.mockResolvedValue({
        id: 'b1',
        status: 'confirmed',
        scheduled_at: new Date('2026-08-01T02:00:00Z'),
        scheduled_end_at: new Date('2026-08-01T02:45:00Z'),
        join_url: 'https://meet.example/abc',
        reschedule_url: 'https://calendly.com/reschedule/abc',
        cancel_url: 'https://calendly.com/cancel/abc',
      });

      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.booking).toMatchObject({
        id: 'b1',
        status: 'confirmed',
        join_url: 'https://meet.example/abc',
        reschedule_url: 'https://calendly.com/reschedule/abc',
      });
    });

    it('normalises absent scheduler fields to null rather than undefined', async () => {
      // undefined disappears through JSON.stringify; the client then cannot
      // tell "no join link" from "field missing from the response".
      prospects.findOneById.mockResolvedValue(PROSPECT);
      bookings.findLatestForProspect.mockResolvedValue({
        id: 'b1',
        status: 'pending',
      });

      const status = await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(status.booking?.join_url).toBeNull();
      expect(status.booking?.scheduled_at).toBeNull();
    });

    it('looks up the latest booking for that prospect only', async () => {
      prospects.findOneById.mockResolvedValue(PROSPECT);
      await service.getPublicStatus(PROSPECT.id!, 'MP-7F3K9A');
      expect(bookings.findLatestForProspect).toHaveBeenCalledWith(PROSPECT.id);
    });
  });
});
