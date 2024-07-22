import { Test, TestingModule } from '@nestjs/testing';
import { RoomListingService } from './room-listing.service';

describe('RoomListingService', () => {
  let service: RoomListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomListingService],
    }).compile();

    service = module.get<RoomListingService>(RoomListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
