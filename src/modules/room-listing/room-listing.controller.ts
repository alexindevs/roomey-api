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
} from '@nestjs/common';
import { RoomListingService } from './room-listing.service';
import {
  CreateRoomListingDto,
  UpdateRoomListingDto,
  SearchRoomListingsDto,
} from './room-listing.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@Controller('room-listings')
export class RoomListingController {
  constructor(private readonly roomListingService: RoomListingService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async createRoomListing(
    @Body() createRoomListingDto: CreateRoomListingDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const response = await this.roomListingService.createRoomListing(
      req.user.userId,
      createRoomListingDto,
    );
    return res.status(response.code).json({
      message: response.message,
      code: response.code,
      data: response.data,
    });
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
