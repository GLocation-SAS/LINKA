import { Test, TestingModule } from '@nestjs/testing';
import { HistorialController } from './historial.controller';

describe('HistorialController', () => {
  let controller: HistorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialController],
    }).compile();

    controller = module.get<HistorialController>(HistorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
