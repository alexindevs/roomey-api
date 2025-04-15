import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SavedRooms } from '../room-listing/room-listing.schema';
import { Model } from 'mongoose';
import { SavedRoommates } from '../roommate-listing/roommate-listing.schema';

@Injectable()
export class SavedListingsService {
  constructor(
    @InjectModel('SavedRooms') private readonly roomModel: Model<SavedRooms>,
    @InjectModel('SavedRoommates')
    private readonly roommateModel: Model<SavedRoommates>,
  ) {}

  async findUserSavedRooms(user_id: string): Promise<SavedRooms[]> {
    try {
      return await this.roomModel
        .find({ user_id })
        .populate('room_id')
        .populate('user_id')
        .exec();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error fetching user saved rooms',
        error,
      );
    }
  }

  async addUserSavedRooms(user_id: string, room_id: string) {
    try {
      const existingRoom = await this.roomModel.findOne({
        user_id,
        room_id,
      });
      if (existingRoom) {
        return await this.roomModel.find({ user_id }).exec();
      }
      await this.roomModel.create({
        user_id,
        room_id,
      });
      return await this.roomModel.find({ user_id }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user saved rooms',
        error,
      );
    }
  }

  async deleteUserSavedRooms(user_id: string, room_id: string) {
    try {
      return await this.roomModel.findOneAndDelete({ user_id, room_id }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user saved rooms',
        error,
      );
    }
  }

  async findUserSavedRoommates(user_id: string): Promise<SavedRoommates[]> {
    try {
      const results = await this.roommateModel
        .find({ user_id })
        .populate('roommate_id')
        .exec();

      return results;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error fetching user saved roommates',
        error,
      );
    }
  }

  async addUserSavedRoommates(user_id: string, roommate_id: string) {
    try {
      const existingRoommate = await this.roommateModel.findOne({
        user_id,
        roommate_id,
      });
      if (existingRoommate) {
        return await this.roommateModel.find({ user_id }).exec();
      }
      await this.roommateModel.create({
        user_id,
        roommate_id,
      });
      return await this.roommateModel.find({ user_id }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error saving user roommate',
        error,
      );
    }
  }

  async deleteUserSavedRoommates(user_id: string, roommate_id: string) {
    try {
      return await this.roommateModel
        .findOneAndDelete({ user_id, roommate_id })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user saved roommate',
        error,
      );
    }
  }
}
