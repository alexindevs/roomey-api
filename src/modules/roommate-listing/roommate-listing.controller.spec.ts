import { Test, TestingModule } from '@nestjs/testing';
import { RoommateListingController } from './roommate-listing.controller';

describe('RoommateListingController', () => {
  let controller: RoommateListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoommateListingController],
    }).compile();

    controller = module.get<RoommateListingController>(
      RoommateListingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
