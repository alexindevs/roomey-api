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
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { CreateUserProfileDto } from './profiles.dto';
import { statusCodes } from 'src/shared/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly cloudinaryService: CloudinaryConfig,
  ) {}

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
    return this.profilesService.createUserProfile({
      ...createUserProfileDto,
      user_id: req.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-picture')
  @UseInterceptors(
    FileInterceptor('profile_picture', {
      storage: diskStorage({
        destination: './uploads', // Temporary storage
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    // Call service to upload profile picture to Cloudinary
    const uploadedImageUrl = await this.cloudinaryService.uploadFile(
      profilePicture.path,
    );

    // Update user profile with the new image URL
    return this.profilesService.uploadProfilePicture(
      userId,
      uploadedImageUrl.url,
    );
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
