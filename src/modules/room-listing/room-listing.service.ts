import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuccessResponse } from 'src/shared/responses';
import { statusCodes } from 'src/shared/constants';
import {
  ApartmentType,
  GenderPreference,
  RentSchedule,
  RoomListing,
  RoomListingDocument,
  RoomType,
} from './room-listing.schema';
import { CreateRoomListingDto } from './room-listing.dto';

@Injectable()
export class RoomListingService {
  constructor(
    @InjectModel(RoomListing.name)
    private roomListingModel: Model<RoomListingDocument>,
  ) {}

  async searchByText(searchText: string): Promise<RoomListing[]> {
    const regex = new RegExp(searchText.replace(/\s+/g, '_'), 'i'); // Replace spaces with underscores
    return this.roomListingModel
      .find({
        $or: [
          { 'location.country': regex },
          { 'location.city': regex },
          { 'location.street_name': regex },
          { 'location.postal_code': regex },
          { apartment_type: regex }, // Search by apartment type
          { room_type: regex }, // Search by room type
          { amenities: { $in: [regex] } }, // Search by amenities
          { description: { $regex: regex } }, // Search within description
        ],
      })
      .exec();
  }

  async searchByGeolocation(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<{ code: number; message: string; data: RoomListing[] }> {
    const filter = {
      'location.geodata': {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1],
        },
      },
    };
    const projection = {};
    const options = {
      lean: true,
    };

    const roomListings = await this.roomListingModel.find(
      filter,
      projection,
      options,
    );

    if (!roomListings || roomListings.length === 0) {
      return {
        code: statusCodes.OK,
        message: 'No room listings found',
        data: [],
      };
    }

    return {
      code: statusCodes.OK,
      message: 'Room listings retrieved successfully',
      data: roomListings,
    };
  }

  async searchByFilters(
    priceRange: { min: number; max: number },
    rentSchedule?: RentSchedule,
    bedrooms?: number,
    bathrooms?: number,
    roomType?: RoomType,
    amenities?: string[],
    page: number = 1,
    limit: number = 10,
  ) {
    const filters: any = {
      rent_amount: { $gte: priceRange.min, $lte: priceRange.max },
      isActive: true,
    };

    if (rentSchedule) filters.rent_schedule = rentSchedule;
    if (bedrooms !== undefined) filters['information.num_bedrooms'] = bedrooms;
    if (bathrooms !== undefined)
      filters['information.num_bathrooms'] = bathrooms;
    if (roomType) filters.room_type = roomType;
    if (amenities && amenities.length > 0)
      filters.amenities = { $all: amenities };

    const skip = (page - 1) * limit;

    try {
      const [listings, total] = await Promise.all([
        this.roomListingModel
          .find(filters)
          .sort({ rent_amount: 'asc' })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.roomListingModel.countDocuments(filters),
      ]);

      if (listings.length === 0) {
        return {
          code: statusCodes.NOT_FOUND,
          message: 'No room listings found',
          data: { listings: [], total: 0 },
        };
      }

      return {
        code: statusCodes.OK,
        message: 'Room listings retrieved successfully',
        data: { listings, total },
      };
    } catch (error) {
      console.error('Error in searchByFilters:', error);
      return {
        code: statusCodes.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while searching for room listings',
        data: { listings: [], total: 0 },
      };
    }
  }

  async createRoomListing(
    user_id: string,
    roomListing: CreateRoomListingDto,
  ): Promise<SuccessResponse> {
    const newRoomListing = new this.roomListingModel({
      user_id,
      ...roomListing,
    });
    await newRoomListing.save();
    return {
      message: 'Room listing created successfully',
      code: statusCodes.CREATED,
      data: newRoomListing,
    };
  }

  async findForHomePage(userLocation: number[]): Promise<SuccessResponse> {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const roomListings = await this.roomListingModel
      .find({
        // Room listings that were created within the last two months
        created_at: { $gte: twoMonthsAgo },

        // Room listings that are not past their deadline
        deadline: { $gte: new Date() },

        // Room listings that are active
        is_active: true,

        // Room listings within 100km of the user's location
        'location.geodata': {
          $geoWithin: {
            $centerSphere: [userLocation, 100 / 6378.1], // 100km radius, Earth radius is approximately 6378.1 km
          },
        },
      })
      .sort({ created_at: -1 }) // Sort by recency
      .exec();

    return {
      message: 'Room listings fetched successfully',
      code: statusCodes.OK,
      data: roomListings,
    };
  }

  async findById(id: string): Promise<SuccessResponse> {
    const roomListing = await this.roomListingModel.findById(id).exec();
    if (!roomListing) {
      return {
        code: statusCodes.NOT_FOUND,
        message: `Room listing with ID ${id} not found`,
        data: null,
      };
    }
    return {
      message: 'Room listing fetched successfully',
      code: statusCodes.OK,
      data: roomListing,
    };
  }

  async updateRoomListing(
    user_id: any,
    id: string,
    updateData: any,
  ): Promise<SuccessResponse> {
    // Fields that should not be updatable
    const forbiddenFields = ['user_id', '_id', 'created_at', 'updated_at'];

    // Check if any forbidden fields are present in updateData
    for (const field of forbiddenFields) {
      if (updateData.hasOwnProperty(field)) {
        return {
          code: statusCodes.FORBIDDEN,
          message: `Field "${field}" cannot be updated`,
          data: null,
        };
      }
    }
    const updatedRoomListing = await this.roomListingModel
      .findOneAndUpdate({ user_id, _id: id }, updateData, { new: true })
      .exec();

    // If no room listing is found, return an error
    if (!updatedRoomListing) {
      return {
        code: statusCodes.NOT_FOUND,
        message: `Room listing with ID ${id} permitted for update not found. Please confirm that this room listing exists and you are the owner.`,
        data: null,
      };
    }

    return {
      message: 'Room listing updated successfully',
      code: statusCodes.OK,
      data: updatedRoomListing,
    };
  }

  /**
   * Deletes a room listing by id. If the room listing is not found,
   * a 404 error is returned.
   *
   * @param id - The id of the room listing to delete
   * @returns A SuccessResponse with a code of 200 if the room listing is deleted
   * successfully, or a 404 error if the room listing is not found.
   */
  async deleteRoomListing(id: string): Promise<SuccessResponse> {
    const result = await this.roomListingModel.findByIdAndDelete(id).exec();
    if (!result) {
      return {
        code: statusCodes.NOT_FOUND,
        message: `Room listing with ID ${id} not found`,
        data: null,
      };
    }
    return {
      message: 'Room listing deleted successfully',
      code: statusCodes.OK,
      data: null,
    };
  }

  async findByUserId(userId: string): Promise<SuccessResponse> {
    const roomListings = await this.roomListingModel
      .find({ user_id: userId })
      .exec();
    return {
      message: 'User room listings fetched successfully',
      code: statusCodes.OK,
      data: roomListings,
    };
  }
}
