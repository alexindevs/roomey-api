import { Test, TestingModule } from '@nestjs/testing';
import { RoomListingController } from './room-listing.controller';

describe('RoomListingController', () => {
  let controller: RoomListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomListingController],
    }).compile();

    controller = module.get<RoomListingController>(RoomListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
