import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { VisaDetailDto } from './update-site-config.dto';

describe('visa editorial metadata', () => {
  const visa = {
    subclass: '189',
    title: 'Visa title',
    description: 'Visa description',
  };
  it('accepts existing content without inventing review metadata', async () => {
    expect(await validate(plainToInstance(VisaDetailDto, visa))).toHaveLength(
      0,
    );
  });
  it('accepts real review metadata and source links', async () => {
    expect(
      await validate(
        plainToInstance(VisaDetailDto, {
          ...visa,
          reviewedAt: '2026-10-01',
          reviewer: { name: 'Example Reviewer', marn: '1234567' },
          sourceUrls: ['https://immi.homeaffairs.gov.au/'],
        }),
      ),
    ).toHaveLength(0);
  });
  it('rejects malformed review dates, registration numbers and source URLs', async () => {
    const errors = await validate(
      plainToInstance(VisaDetailDto, {
        ...visa,
        reviewedAt: 'not-a-date',
        reviewer: { name: 'Example', marn: 'XXXXXX' },
        sourceUrls: ['javascript:alert(1)'],
      }),
    );
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['reviewedAt', 'reviewer', 'sourceUrls']),
    );
  });
});
