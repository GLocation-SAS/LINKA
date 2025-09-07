import { Test, TestingModule } from '@nestjs/testing';
import { AudienciasService } from './audiencias.service';

describe('AudienciasService', () => {
  let service: AudienciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudienciasService],
    }).compile();

    service = module.get<AudienciasService>(AudienciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
