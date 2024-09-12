import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { CreateUserProfileDto } from './profiles.dto';
import { statusCodes } from 'src/shared/constants';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Get a profile by user ID
   * This route does not require authentication
   * @param {string} userId - User ID
   * @returns {UserProfile} - User profile details
   */
  @Get('/user/:id')
  async getProfileByUserId(@Param('id') userId: string) {
    return this.profilesService.findUserProfileByUserId(userId);
  }

  /**
   * Get a profile by profile ID
   * This route does not require authentication
   * @param {string} id - Profile ID
   * @returns {UserProfile} - User profile details
   */
  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.findProfileById(id);
  }

  /**
   * Create a new profile
   * This route requires authentication
   * @param {CreateUserProfileDto} createUserProfileDto - Profile data
   * @returns {UserProfile} - Created user profile
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createProfile(
    @Body() createUserProfileDto: CreateUserProfileDto,
    @Request() req,
  ) {
    // Set the user_id from the authenticated user in the request
    return this.profilesService.createUserProfile({ ...createUserProfileDto, user_id: req.user.userId });
  }

  /**
   * Update an existing profile
   * This route requires authentication
   * @param {string} userId - User ID
   * @param {CreateUserProfileDto} updateUserProfileDto - Profile data to update
   * @returns {UserProfile} - Updated user profile
   */
  @UseGuards(JwtAuthGuard)
  @Put(':userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: Partial<CreateUserProfileDto>,
    @Request() req,
  ) {
    // Ensure that the authenticated user can only update their own profile
    if (userId !== req.user.userId) {
      return {
        message: 'Unauthorized access',
        code: statusCodes.UNAUTHORIZED,
      };
    }
    return this.profilesService.updateProfile(userId, updateUserProfileDto);
  }

  /**
   * Delete a profile by user ID
   * This route requires authentication
   * @param {string} userId - User ID
   * @returns {UserProfile} - Deleted user profile
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteProfile(@Param('userId') userId: string, @Request() req) {
    // Ensure that the authenticated user can only delete their own profile
    if (userId !== req.user.userId) {
      return {
        message: 'Unauthorized access',
        code: statusCodes.UNAUTHORIZED,
      };
    }
    return this.profilesService.deleteProfile(userId);
  }
}
