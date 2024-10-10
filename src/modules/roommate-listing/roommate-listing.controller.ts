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
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoommateListingService } from './roommate-listing.service';
import {
  CreateRoommateListingDto,
  UpdateRoommateListingDto,
} from './roommate-listing.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Controller('roommate-listings')
export class RoommateListingController {
  constructor(
    private readonly roommateListingService: RoommateListingService,
    private readonly cloudinaryService: CloudinaryConfig,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  async uploadRoommateListingImages(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Param('listingId') listingId: string,
    @Req() req: any,
  ) {
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
  @UseGuards(JwtAuthGuard)
  async fetchHomepageRoommateListings(@Req() req: any) {
    const userId = req.user.userId;
    return this.roommateListingService.fetchHomepageRoommateListings(userId);
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
