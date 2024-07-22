import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorResponse, SuccessResponse } from 'src/shared/responses';
import { statusCodes } from 'src/shared/constants';
import { RoomListing, RoomListingDocument } from './room-listing.schema';

@Injectable()
export class RoomListingService {
  constructor(
    @InjectModel(RoomListing.name)
    private roomListingModel: Model<RoomListingDocument>,
  ) {}

  async searchByText(searchText: string): Promise<RoomListing[]> {
    const regex = new RegExp(searchText, 'i');
    return this.roomListingModel
      .find({
        $or: [
          { 'location.country': regex },
          { 'location.city': regex },
          { 'location.street_name': regex },
          { 'location.postal_code': regex },
        ],
      })
      .exec();
  }

  async searchByGeolocation(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<RoomListing[]> {
    return this.roomListingModel
      .find({
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius / 6378.1],
          },
        },
      })
      .exec();
  }

  async createRoomListing(roomListing: RoomListing): Promise<SuccessResponse> {
    const newRoomListing = new this.roomListingModel(roomListing);
    await newRoomListing.save();
    return {
      message: 'Room listing created successfully',
      code: statusCodes.CREATED,
      data: newRoomListing,
    };
  }

  async findAll(): Promise<SuccessResponse> {
    const roomListings = await this.roomListingModel.find().exec();
    return {
      message: 'Room listings fetched successfully',
      code: statusCodes.OK,
      data: roomListings,
    };
  }

  async findById(id: string): Promise<SuccessResponse | ErrorResponse> {
    const roomListing = await this.roomListingModel.findById(id).exec();
    if (!roomListing) {
      return {
        code: statusCodes.NOT_FOUND,
        error: `Room listing with ID ${id} not found`,
      };
    }
    return {
      message: 'Room listing fetched successfully',
      code: statusCodes.OK,
      data: roomListing,
    };
  }

  async updateRoomListing(
    id: string,
    updateData: Partial<RoomListing>,
  ): Promise<SuccessResponse | ErrorResponse> {
    const updatedRoomListing = await this.roomListingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedRoomListing) {
      return {
        code: statusCodes.NOT_FOUND,
        error: `Room listing with ID ${id} not found`,
      };
    }
    return {
      message: 'Room listing updated successfully',
      code: statusCodes.OK,
      data: updatedRoomListing,
    };
  }

  async deleteRoomListing(
    id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    const result = await this.roomListingModel.findByIdAndDelete(id).exec();
    if (!result) {
      return {
        code: statusCodes.NOT_FOUND,
        error: `Room listing with ID ${id} not found`,
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

  async searchByFilters(
    priceRange: { min: number; max: number },
    bedrooms: number,
    bathrooms: number,
    amenities: string[],
    moveInDate: Date,
    keywords?: string,
  ): Promise<RoomListing[]> {
    const filters: any = {
      rent_amount: { $gte: priceRange.min, $lte: priceRange.max },
      'information.num_bedrooms': bedrooms,
      'information.num_bathrooms': bathrooms,
      amenities: { $all: amenities },
      deadline: { $gte: moveInDate },
    };

    if (keywords) {
      filters.$text = { $search: keywords };
    }

    return this.roomListingModel.find(filters).exec();
  }
}
