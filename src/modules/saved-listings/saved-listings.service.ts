import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SavedRooms } from '../room-listing/room-listing.schema';
import { Model } from 'mongoose';

@Injectable()
export class SavedListingsService {
  constructor(
    @InjectModel('SavedRooms') private readonly roomModel: Model<SavedRooms>,
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
}
