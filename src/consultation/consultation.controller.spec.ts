import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';

describe('ConsultationController', () => {
  let controller: ConsultationController;
  let service: jest.Mocked<ConsultationService>;

  const mockUser: AuthUser = { id: 'user-1', email: 'jane@example.com' } as AuthUser;

  beforeEach(async () => {
    // Note: the previous version of this spec only registered
    // ConsultationController with no providers. Its constructor requires
    // ConsultationService, so Nest's DI container would throw "cannot
    // resolve dependencies" compiling that testing module — this spec
    // would never have actually run. Fixed here with a real mock.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationController],
      providers: [
        {
          provide: ConsultationService,
          useValue: {
            submitQuestionnaire: jest.fn(),
            findMyQuestionnaire: jest.fn(),
            findAllQuestionnaires: jest.fn(),
            findAllBookings: jest.fn(),
            deliverStrategy: jest.fn(),
            deleteBooking: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConsultationController>(ConsultationController);
    service = module.get(ConsultationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitQuestionnaire', () => {
    it('submits on behalf of the authenticated user', async () => {
      const dto = { responses: { goal: 'skilled-migration' } };
      service.submitQuestionnaire.mockResolvedValue({ id: 'q-1' } as any);

      const result = await controller.submitQuestionnaire(mockUser, dto as any);

      expect(service.submitQuestionnaire).toHaveBeenCalledWith('user-1', dto.responses);
      expect(result).toEqual({ id: 'q-1' });
    });
  });

  describe('findMyQuestionnaire', () => {
    it('looks up the calling user\'s own questionnaire', async () => {
      service.findMyQuestionnaire.mockResolvedValue([{ id: 'q-1' }] as any);

      await controller.findMyQuestionnaire(mockUser);

      expect(service.findMyQuestionnaire).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAllQuestionnaires', () => {
    it('defaults pagination when no query params are given', async () => {
      service.findAllQuestionnaires.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await controller.findAllQuestionnaires({});

      expect(service.findAllQuestionnaires).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('deliverStrategy', () => {
    it('delegates to the service with the route param and body', async () => {
      service.deliverStrategy.mockResolvedValue({ id: 'booking-1' } as any);

      await controller.deliverStrategy('booking-1', { strategy: 'plan A' } as any);

      expect(service.deliverStrategy).toHaveBeenCalledWith('booking-1', 'plan A');
    });
  });

  describe('remove', () => {
    it('delegates deletion to the service', async () => {
      await controller.remove('booking-1');

      expect(service.deleteBooking).toHaveBeenCalledWith('booking-1');
    });
  });
});
