import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import { RoomListingService } from './room-listing.service';
import {
  CreateRoomListingDto,
  UpdateRoomListingDto,
  SearchRoomListingsDto,
} from './room-listing.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryConfig } from '../file-uploads/cloudinary.config';

@Controller('room-listings')
export class RoomListingController {
  constructor(
    private readonly roomListingService: RoomListingService,
    private readonly cloudinaryConfig: CloudinaryConfig,
  ) {}

  @Post(':roomId/upload-images')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 8 }]))
  async uploadRoomListing(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Res() res: Response,
    @Param('roomId') roomId: string,
    @Req() req: any,
  ) {
    try {
      if (!files || !files.images || files.images.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Upload images to Cloudinary using file.buffer instead of file.path
      const uploadedImageUrls = await Promise.all(
        files.images.map(
          (file) => this.cloudinaryConfig.uploadFileFromBuffer(file.buffer), // use file.buffer here
        ),
      );

      const response = await this.roomListingService.uploadRoomImages(
        roomId,
        req.user.userId,
        uploadedImageUrls.map((image) => image.url as string),
      );

      return res.status(response.code).json({
        message: response.message,
        code: response.code,
        data: response.data,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createRoomListing(
    @Body() createRoomListingDto: CreateRoomListingDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const response = await this.roomListingService.createRoomListing(
        req.user.userId,
        createRoomListingDto,
      );

      return res.status(response.code).json({
        message: response.message,
        code: response.code,
        data: response.data,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Room listing creation failed', error });
    }
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivateRoomListing(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const deactivatedListing =
      await this.roomListingService.deactivateRoomListing(id, req.user.userId);
    return res.status(deactivatedListing.code).json({
      message: deactivatedListing.message,
      code: deactivatedListing.code,
      data: deactivatedListing.data,
    });
  }

  @Post(':id/reactivate')
  @UseGuards(JwtAuthGuard)
  async reactivateRoomListing(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const reactivatedListing =
      await this.roomListingService.reactivateRoomListing(id, req.user.userId);
    return res.status(reactivatedListing.code).json({
      message: reactivatedListing.message,
      code: reactivatedListing.code,
      data: reactivatedListing.data,
    });
  }

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRoomListings(
    @Query() query: SearchRoomListingsDto,
    @Res() res: Response,
  ) {
    const response = await this.roomListingService.searchRoomListings(query);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  async getRoomListingsByUserId(
    @Req() req: any,
    @Query('isActive') isActive: string,
  ) {
    const activeStatus = isActive === 'false' ? false : true; // Default to true if no query parameter is provided
    return this.roomListingService.findByUserIdAndStatus(
      req.user.userId,
      activeStatus,
    );
  }

  @Get()
  async findAll(
    @Query('lng') lng: number,
    @Query('lat') lat: number,
    @Res() res: Response,
  ) {
    const response = await this.roomListingService.findForHomePage([lng, lat]);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: Response) {
    const response = await this.roomListingService.findById(id);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async updateRoomListing(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateRoomListingDto: UpdateRoomListingDto,
    @Res() res: Response,
  ) {
    const response = await this.roomListingService.updateRoomListing(
      req.user.userId,
      id,
      updateRoomListingDto,
    );
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }

  @Delete(':id')
  async deleteRoomListing(@Param('id') id: string, @Res() res: Response) {
    const response = await this.roomListingService.deleteRoomListing(id);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string, @Res() res: Response) {
    const response = await this.roomListingService.findByUserId(userId);
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
  }
}
