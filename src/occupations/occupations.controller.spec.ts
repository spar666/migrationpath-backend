import { Test, TestingModule } from '@nestjs/testing';
import { OccupationsController } from './occupations.controller';

describe('OccupationsController', () => {
  let controller: OccupationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupationsController],
    }).compile();

    controller = module.get<OccupationsController>(OccupationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
