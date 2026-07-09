import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsController', () => {
  let controller: LeadsController;
  let service: jest.Mocked<LeadsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
    service = module.get(LeadsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to LeadsService.create with the request body', async () => {
      const dto: CreateLeadDto = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        source: 'quote_page',
      };
      const created = { id: 'lead-1', ...dto };
      service.create.mockResolvedValue(created as any);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('passes pagination query params through, defaulting when absent', async () => {
      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith(1, 20);
    });

    it('respects explicit page/limit query params', async () => {
      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      });

      await controller.findAll({ page: 2, limit: 5 });

      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('updateStatus', () => {
    it('delegates to LeadsService.updateStatus', async () => {
      const updated = { id: 'lead-1', status: 'converted' };
      service.updateStatus.mockResolvedValue(updated as any);

      const result = await controller.updateStatus('lead-1', { status: 'converted' });

      expect(service.updateStatus).toHaveBeenCalledWith('lead-1', { status: 'converted' });
      expect(result).toEqual(updated);
    });
  });
});
