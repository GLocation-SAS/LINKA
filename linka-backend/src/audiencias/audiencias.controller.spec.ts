import { Test, TestingModule } from '@nestjs/testing';
import { AudienciasController } from './audiencias.controller';

describe('AudienciasController', () => {
  let controller: AudienciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudienciasController],
    }).compile();

    controller = module.get<AudienciasController>(AudienciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
