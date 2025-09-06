import { Test, TestingModule } from '@nestjs/testing';
import { CampanasService } from './campanas.service';

describe('CampanasService', () => {
  let service: CampanasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampanasService],
    }).compile();

    service = module.get<CampanasService>(CampanasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
