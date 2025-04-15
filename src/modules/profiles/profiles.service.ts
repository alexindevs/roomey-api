import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile, UserProfileDocument } from './profiles.schema';
import { statusCodes } from 'src/shared/constants';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(UserProfile.name)
    private userProfileModel: Model<UserProfileDocument>,
  ) {}

  /**
   * Creates a new user profile
   * @param {CreateUserProfileDto} createUserProfileDto - DTO containing data for the new user profile
   * @returns {Promise<UserProfile>} - The created user profile
   */
  async createUserProfile(createUserProfileDto: any) {
    const { user_id } = createUserProfileDto;

    // Check if user already has a profile
    const existingProfile = await this.userProfileModel.findOne({ user_id });
    if (existingProfile) {
      throw new BadRequestException('User profile already exists');
    }

    // Create new user profile
    const createdProfile =
      await this.userProfileModel.create(createUserProfileDto);
    return {
      message: 'User profile created successfully',
      data: createdProfile,
      code: statusCodes.CREATED,
    };
  }

  async uploadProfilePicture(
    userId: string,
    uploadedImageUrl: string,
  ): Promise<any> {
    // Update user profile with the new profile picture URL
    const updatedProfile = await this.userProfileModel.findOneAndUpdate(
      { user_id: userId },
      { profile_picture: uploadedImageUrl },
      { new: true },
    );

    if (!updatedProfile) {
      throw new BadRequestException('User profile not found');
    }

    return {
      message: 'Profile picture uploaded successfully',
      data: updatedProfile,
      code: statusCodes.OK,
    };
  }

  /**
   * Fetches a user profile by its user ID
   * @param {string} userId - The user ID to search for
   * @returns {Promise<UserProfile>} - The user profile if found
   */
  async findUserProfileByUserId(userId: string) {
    const userProfile = await this.userProfileModel.findOne({
      user_id: userId,
    });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
    return {
      message: 'User profile found successfully',
      data: userProfile,
      code: statusCodes.OK,
    };
  }

  async updateProfile(userId: string, updateUserProfileDto: any) {
    const userProfile = await this.userProfileModel.findOne({
      user_id: userId,
    });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    // Remove fields that shouldn't be updated
    // @eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_id, _id, created_at, updated_at, ...updatableData } =
      updateUserProfileDto;

    const updatedProfile = await this.userProfileModel
      .findOneAndUpdate(
        { user_id: userId },
        { $set: updatableData },
        { new: true },
      )
      .exec();

    return {
      message: 'Profile updated successfully',
      data: updatedProfile,
      code: statusCodes.OK,
    };
  }

  async deleteProfile(userId: string) {
    const userProfile = await this.userProfileModel.findOne({
      user_id: userId,
    });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
    const deletedProfile = await this.userProfileModel.findOneAndDelete({
      user_id: userId,
    });
    return {
      message: 'Profile deleted successfully',
      data: deletedProfile,
      code: statusCodes.OK,
    };
  }

  async findProfileById(id: string) {
    const userProfile = await this.userProfileModel.findById(id);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
    return {
      message: 'User profile found successfully',
      data: userProfile,
      code: statusCodes.OK,
    };
  }
}
