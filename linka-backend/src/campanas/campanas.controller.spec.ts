import { Test, TestingModule } from '@nestjs/testing';
import { CampanasController } from './campanas.controller';

describe('CampanasController', () => {
  let controller: CampanasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampanasController],
    }).compile();

    controller = module.get<CampanasController>(CampanasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
