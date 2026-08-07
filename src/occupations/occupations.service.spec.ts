import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OccupationsService } from './occupations.service';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { Visa } from './entities/visa.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';

describe('OccupationsService', () => {
  let service: OccupationsService;
  let occupations: { findOne: jest.Mock };

  beforeEach(async () => {
    occupations = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OccupationsService,
        { provide: getRepositoryToken(Occupation), useValue: occupations },
        { provide: getRepositoryToken(OccupationThreshold), useValue: {} },
        { provide: getRepositoryToken(Visa), useValue: {} },
        { provide: getRepositoryToken(OccupationVisa), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<OccupationsService>(OccupationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * This feeds the employer-sponsored engine, which reads null and false very
   * differently: null becomes an open question for the agent, false disqualifies
   * the subclass outright. Anything we genuinely don't know must return null.
   */
  describe('isOnAnyList', () => {
    it('confirms an occupation classified on a required list', async () => {
      occupations.findOne.mockResolvedValue({ primary_list: 'CSOL' });
      await expect(service.isOnAnyList('261313', ['CSOL'])).resolves.toBe(true);
    });

    it('rejects an occupation classified on a different list', async () => {
      occupations.findOne.mockResolvedValue({ primary_list: 'MLTSSL' });
      await expect(service.isOnAnyList('261313', ['CSOL'])).resolves.toBe(
        false,
      );
    });

    it('returns unknown for an occupation not in the catalogue', async () => {
      // Not evidence of absence from the list — our catalogue may just be
      // incomplete, and a false here would wrongly disqualify the prospect.
      occupations.findOne.mockResolvedValue(null);
      await expect(service.isOnAnyList('999999', ['CSOL'])).resolves.toBeNull();
    });

    it('returns unknown for an occupation that exists but is unclassified', async () => {
      occupations.findOne.mockResolvedValue({ primary_list: null });
      await expect(service.isOnAnyList('261313', ['CSOL'])).resolves.toBeNull();
    });

    it('returns unknown without querying when no code was given', async () => {
      await expect(
        service.isOnAnyList(undefined, ['CSOL']),
      ).resolves.toBeNull();
      expect(occupations.findOne).not.toHaveBeenCalled();
    });
  });
});
