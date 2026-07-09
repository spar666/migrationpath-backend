import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { LeadsRepository } from './leads.repository';
import { LeadNotifierService } from './lead-notifier.service';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let repo: jest.Mocked<LeadsRepository>;
  let notifier: jest.Mocked<LeadNotifierService>;

  const mockLead: Lead = {
    id: 'lead-1',
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+61400000000',
    visa_type: 'skilled-189',
    message: 'Interested in skilled migration',
    package_id: undefined,
    source: 'quote_slideover',
    status: 'new',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: LeadsRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            paginate: jest.fn(),
          },
        },
        {
          provide: LeadNotifierService,
          useValue: {
            notifyNewLead: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repo = module.get(LeadsRepository);
    notifier = module.get(LeadNotifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateLeadDto = {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+61400000000',
      visa_type: 'skilled-189',
      message: 'Interested in skilled migration',
      source: 'quote_slideover',
    };

    it('persists the lead via the repository', async () => {
      repo.create.mockResolvedValue(mockLead);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: dto.full_name,
          email: dto.email,
          phone: dto.phone,
          visa_type: dto.visa_type,
          message: dto.message,
          source: dto.source,
        }),
      );
      expect(result).toEqual(mockLead);
    });

    it('defaults source to "other" when not provided', async () => {
      repo.create.mockResolvedValue(mockLead);
      const { source, ...dtoWithoutSource } = dto;

      await service.create(dtoWithoutSource as CreateLeadDto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'other' }),
      );
    });

    it('fires a notification after successfully creating the lead', async () => {
      repo.create.mockResolvedValue(mockLead);

      await service.create(dto);

      expect(notifier.notifyNewLead).toHaveBeenCalledWith(mockLead);
    });

    it('still returns the created lead even if notification fails', async () => {
      repo.create.mockResolvedValue(mockLead);
      notifier.notifyNewLead.mockRejectedValue(new Error('SMTP down'));

      // Should not throw — notification failures must never surface to the caller.
      const result = await service.create(dto);

      expect(result).toEqual(mockLead);
    });

    it('discards the submission without persisting when the honeypot field is filled', async () => {
      const spammyDto: CreateLeadDto = { ...dto, website: 'http://spam.example' };

      const result = await service.create(spammyDto);

      expect(repo.create).not.toHaveBeenCalled();
      expect(notifier.notifyNewLead).not.toHaveBeenCalled();
      // Still returns a lead-shaped success response so the caller (bot or
      // otherwise) can't distinguish this from a real submission.
      expect(result.email).toBe(spammyDto.email);
    });
  });

  describe('findAll', () => {
    it('delegates pagination to the repository', async () => {
      const paginatedResult = {
        data: [mockLead],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      repo.paginate.mockResolvedValue(paginatedResult);

      const result = await service.findAll(1, 20);

      expect(repo.paginate).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('updateStatus', () => {
    it('updates the lead status via the repository', async () => {
      const updatedLead = { ...mockLead, status: 'contacted' as const };
      repo.update.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('lead-1', { status: 'contacted' });

      expect(repo.update).toHaveBeenCalledWith('lead-1', { status: 'contacted' });
      expect(result.status).toBe('contacted');
    });
  });
});
