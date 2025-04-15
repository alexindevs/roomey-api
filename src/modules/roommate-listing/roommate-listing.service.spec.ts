import { Test, TestingModule } from '@nestjs/testing';
import { RoommateListingService } from './roommate-listing.service';

describe('RoommateListingService', () => {
  let service: RoommateListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoommateListingService],
    }).compile();

    service = module.get<RoommateListingService>(RoommateListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
