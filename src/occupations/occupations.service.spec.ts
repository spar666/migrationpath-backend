import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OccupationsService } from './occupations.service';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { Visa } from './entities/visa.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';

describe('OccupationsService', () => {
  let service: OccupationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OccupationsService,
        { provide: getRepositoryToken(Occupation), useValue: {} },
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
});
