import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoommateListingService } from './roommate-listing.service';
import { Response } from 'express';
import {
  CreateRoommateListingDto,
  UpdateRoommateListingDto,
} from './roommate-listing.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';
import { ActiveUserGuard } from '../authentication/guards/active-user.guard';

@Controller('roommate-listings')
export class RoommateListingController {
  constructor(
    private readonly roommateListingService: RoommateListingService,
    private readonly cloudinaryService: CloudinaryConfig,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async createRoommateListing(
    @Body() createRoommateListingDto: CreateRoommateListingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    createRoommateListingDto.user_id = userId;

    // // Upload images to Cloudinary
    // const uploadedImages = await Promise.all(
    //   files.map((file) => this.cloudinaryService.uploadFile(file.path)),
    // );

    // createRoommateListingDto.images = uploadedImages.map((image) => image.url);

    return this.roommateListingService.create(createRoommateListingDto);
  }

  @Post(':listingId/upload-images')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  async uploadRoommateListingImages(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Param('listingId') listingId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!files || !files.images || files.images.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const userId = req.user.userId;
    const uploadedImages = await Promise.all(
      files.images.map((file) =>
        this.cloudinaryService.uploadFileFromBuffer(file.buffer),
      ),
    );
    return this.roommateListingService.uploadImages(
      listingId,
      userId,
      uploadedImages.map((image) => image.url as string),
    );
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: string) {
    return this.roommateListingService.findAllByUserId(userId);
  }

  @Get('homepage')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async fetchHomepageRoommateListings(@Req() req: any) {
    const userId = req.user.userId;
    return this.roommateListingService.fetchHomepageRoommateListings(userId);
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async findByUserIdAndStatus(
    @Req() req: any,
    @Query('isActive') isActive: string,
  ) {
    const activeStatus = isActive === 'false' ? false : true; // Default to true if no query parameter is provided
    return this.roommateListingService.findByUserIdAndStatus(
      req.user.userId,
      activeStatus,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roommateListingService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRoommateListingDto: UpdateRoommateListingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const listing = await this.roommateListingService.findOne(id);
    if (listing.data.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this listing',
      );
    }
    return this.roommateListingService.update(id, updateRoommateListingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const listing = await this.roommateListingService.findOne(id);
    if (listing.data.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this listing',
      );
    }
    return this.roommateListingService.remove(id);
  }
}
