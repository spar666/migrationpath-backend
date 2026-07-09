import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationService } from './consultation.service';
import {
  ConsultationQuestionnaireRepository,
  ConsultationBookingRepository,
} from './consultation.repository';

describe('ConsultationService', () => {
  let service: ConsultationService;
  let questionnaireRepo: jest.Mocked<
    Pick<ConsultationQuestionnaireRepository, 'create' | 'findLatestByUserId' | 'paginateWithUser'>
  >;
  let bookingRepo: jest.Mocked<
    Pick<ConsultationBookingRepository, 'paginate' | 'deliverStrategy' | 'hardDelete'>
  >;

  beforeEach(async () => {
    // Note: the previous version of this spec only registered
    // ConsultationService with no mocked dependencies. Its constructor
    // requires ConsultationQuestionnaireRepository and
    // ConsultationBookingRepository, so Nest's DI container would throw
    // "cannot resolve dependencies" compiling that testing module — this
    // spec would never have actually run. Fixed here with real mocks.
    questionnaireRepo = {
      create: jest.fn(),
      findLatestByUserId: jest.fn(),
      paginateWithUser: jest.fn(),
    };
    bookingRepo = {
      paginate: jest.fn(),
      deliverStrategy: jest.fn(),
      hardDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationService,
        { provide: ConsultationQuestionnaireRepository, useValue: questionnaireRepo },
        { provide: ConsultationBookingRepository, useValue: bookingRepo },
      ],
    }).compile();

    service = module.get<ConsultationService>(ConsultationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitQuestionnaire', () => {
    it('creates a questionnaire tied to the submitting user', async () => {
      const responses = { goal: 'skilled-migration' };
      questionnaireRepo.create.mockResolvedValue({ id: 'q-1', user_id: 'user-1', responses } as any);

      const result = await service.submitQuestionnaire('user-1', responses);

      expect(questionnaireRepo.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        responses,
      });
      expect(result.id).toBe('q-1');
    });
  });

  describe('findMyQuestionnaire', () => {
    it('delegates to findLatestByUserId', async () => {
      questionnaireRepo.findLatestByUserId.mockResolvedValue([{ id: 'q-1' } as any]);

      const result = await service.findMyQuestionnaire('user-1');

      expect(questionnaireRepo.findLatestByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('deliverStrategy', () => {
    it('delegates to the booking repository', async () => {
      bookingRepo.deliverStrategy.mockResolvedValue({ id: 'booking-1', strategy: 'plan A' } as any);

      const result = await service.deliverStrategy('booking-1', 'plan A');

      expect(bookingRepo.deliverStrategy).toHaveBeenCalledWith('booking-1', 'plan A');
      expect(result.strategy).toBe('plan A');
    });
  });

  describe('deleteBooking', () => {
    it('delegates to hardDelete', async () => {
      await service.deleteBooking('booking-1');

      expect(bookingRepo.hardDelete).toHaveBeenCalledWith('booking-1');
    });
  });
});
