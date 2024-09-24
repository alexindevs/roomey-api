import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoommateListing,
  RoommateListingDocument,
} from './roommate-listing.schema';
import { CreateRoommateListingDto } from './roommate-listing.dto';
import { UpdateRoommateListingDto } from './roommate-listing.dto';
import { UserProfile, UserProfileDocument } from '../profiles/profiles.schema';

@Injectable()
export class RoommateListingService {
  constructor(
    @InjectModel(RoommateListing.name)
    private roommateListingModel: Model<RoommateListingDocument>,
    @InjectModel(UserProfile.name)
    private userProfileModel: Model<UserProfileDocument>,
  ) {}

  async create(createRoommateListingDto: CreateRoommateListingDto) {
    const newListing = await this.roommateListingModel.create(
      createRoommateListingDto,
    );
    return {
      message: 'Roommate listing created successfully',
      data: newListing,
      code: 201,
    };
  }

  async fetchHomepageRoommateListings(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    // Fetch the user's profile based on userId
    const userProfile = await this.userProfileModel.findOne({
      user_id: userId,
    });

    // If user profile doesn't exist, throw an error
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    console.log('User Profile:', userProfile);

    // Determine age range (±5 years)
    const minAge = userProfile.age - 5;
    const maxAge = userProfile.age + 5;

    // Extract preferred cities and states from user profile
    const preferredCities = userProfile.preferred_locations.map(
      (loc) => loc.city,
    );
    const preferredStates = userProfile.preferred_locations.map(
      (loc) => loc.state,
    );

    // Define the query criteria based on user preferences
    const query = {
      'location_preference.city': { $in: preferredCities },
      'location_preference.state': { $in: preferredStates },
      'roommate_spec.preferred_gender': { $in: [userProfile.gender, 'None'] },
      age: { $gte: minAge, $lte: maxAge },
      is_active: true,
    };

    // Calculate total listings for pagination
    const totalListings = await this.roommateListingModel
      .countDocuments(query)
      .exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalListings / pageSize);

    // Fetch roommate listings with pagination
    const roommateListings = await this.roommateListingModel
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    // Sort the listings based on matching scores
    const sortedListings = roommateListings.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Location score
      scoreA +=
        a.location_preference.city === userProfile.location.city ? 3 : 0;
      scoreB +=
        b.location_preference.city === userProfile.location.city ? 3 : 0;

      // Lifestyle habits score
      scoreA += this.calculateMatchScore(
        a.lifestyle_habits,
        userProfile.interests,
      );
      scoreB += this.calculateMatchScore(
        b.lifestyle_habits,
        userProfile.interests,
      );

      // Personality traits score
      scoreA += this.calculateMatchScore(
        a.personality_traits,
        userProfile.personality_traits,
      );
      scoreB += this.calculateMatchScore(
        b.personality_traits,
        userProfile.personality_traits,
      );

      // Budget score (within 20% range)
      const userBudget = userProfile.budget.amount;
      scoreA += Math.abs(a.budget - userBudget) <= userBudget * 0.2 ? 2 : 0;
      scoreB += Math.abs(b.budget - userBudget) <= userBudget * 0.2 ? 2 : 0;

      // Age score
      scoreA += this.calculateAgeScore(a.age, userProfile.age);
      scoreB += this.calculateAgeScore(b.age, userProfile.age);

      return scoreB - scoreA; // Sort in descending order
    });

    // Prepare the response with pagination metadata
    return {
      message: 'Roommate listings fetched successfully',
      data: sortedListings,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalPages: totalPages,
        totalListings: totalListings,
      },
      code: 200,
    };
  }

  // async fetchRoommateListingByUserId(userId: string) {
  //   const listings = await this.roommateListingModel
  //     .find({ user_id: userId })
  //     .exec();
  //   if (!listings) {
  //     throw new NotFoundException(`Roommate listings not found`);
  //   }
  //   return {
  //     message: 'Roommate listings found successfully',
  //     data: listings,
  //     code: 200,
  //   };
  // }

  private calculateMatchScore(
    listingTraits: string[],
    userTraits: string[],
  ): number {
    return listingTraits.filter((trait) => userTraits.includes(trait)).length;
  }

  private calculateAgeScore(listingAge: number, userAge: number): number {
    const ageDifference = Math.abs(listingAge - userAge);
    if (ageDifference === 0) return 5;
    if (ageDifference <= 1) return 4;
    if (ageDifference <= 2) return 3;
    if (ageDifference <= 3) return 2;
    if (ageDifference <= 5) return 1;
    return 0;
  }

  async findAllByUserId(userId: string) {
    const listings = await this.roommateListingModel
      .find({ user_id: userId })
      .exec();
    if (!listings) {
      throw new NotFoundException(`Roommate listings not found`);
    }
    return {
      message: 'Roommate listings found successfully',
      data: listings,
      code: 200,
    };
  }

  async findOne(id: string) {
    const listing = await this.roommateListingModel.findById(id).exec();
    if (!listing) {
      throw new NotFoundException(`Roommate listing with ID ${id} not found`);
    }
    return {
      message: 'Roommate listing found successfully',
      data: listing,
      code: 200,
    };
  }

  async update(id: string, updateRoommateListingDto: UpdateRoommateListingDto) {
    const updatedListing = await this.roommateListingModel
      .findByIdAndUpdate(id, updateRoommateListingDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedListing) {
      throw new NotFoundException(`Roommate listing with ID ${id} not found`);
    }
    return {
      message: 'Roommate listing updated successfully',
      data: updatedListing,
      code: 200,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.roommateListingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Roommate listing with ID ${id} not found`);
    }
  }
}
