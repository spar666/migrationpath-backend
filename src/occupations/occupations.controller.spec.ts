import { Test, TestingModule } from '@nestjs/testing';
import { OccupationsController } from './occupations.controller';
import { OccupationsService } from './occupations.service';

describe('OccupationsController', () => {
  let controller: OccupationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupationsController],
      providers: [{ provide: OccupationsService, useValue: {} }],
    }).compile();

    controller = module.get<OccupationsController>(OccupationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
