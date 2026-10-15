import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OccupationsService } from './occupations.service';
import { Occupation, OccupationThreshold } from './entities/occupation.entity';
import { OccupationVisa } from './entities/occupation-visa.entity';
import { Visa } from './entities/visa.entity';

describe('public occupation build feed', () => {
  it('includes only active visa mappings and records mapping modification dates', async () => {
    const repository = {
      findAndCount: jest.fn().mockResolvedValue([
        [
          {
            anzsco_code: '261313',
            occupation_name: 'Software Engineer',
            description: 'Occupation description',
            assessing_authority: 'ACS',
            updated_at: new Date('2026-01-01'),
            listMemberships: [{ list_code: 'MLTSSL' }],
            occupationVisas: [
              {
                is_active: true,
                updated_at: new Date('2026-02-01'),
                visa: {
                  is_active: true,
                  subclass_number: '189',
                  stream_title: 'Skilled',
                  updated_at: new Date('2026-03-01'),
                },
              },
              {
                is_active: false,
                updated_at: new Date('2026-04-01'),
                visa: { is_active: true, subclass_number: '190' },
              },
              {
                is_active: true,
                visa: { is_active: false, subclass_number: '491' },
              },
            ],
          },
        ],
        1,
      ]),
    };
    const module = await Test.createTestingModule({
      providers: [
        OccupationsService,
        { provide: getRepositoryToken(Occupation), useValue: repository },
        ...[OccupationThreshold, OccupationVisa, Visa].map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {},
        })),
        { provide: DataSource, useValue: {} },
      ],
    }).compile();
    const result = await module.get(OccupationsService).findSeoPage(2, 100);
    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
        skip: 100,
        order: { anzsco_code: 'ASC' },
      }),
    );
    expect(
      result.data[0].eligibleVisas.map((visa) => visa.subclassNumber),
    ).toEqual(['189']);
    expect(result.data[0].updated_at?.toISOString()).toBe(
      '2026-04-01T00:00:00.000Z',
    );
    expect(result.totalPages).toBe(1);
  });
});
