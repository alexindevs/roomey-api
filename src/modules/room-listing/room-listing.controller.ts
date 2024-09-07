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
  SearchByTextDto,
  SearchByGeolocationDto,
  SearchByFiltersDto,
} from './room-listing.dto';
import { Response } from 'express';
import { statusCodes } from '../../shared/constants';
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

  @Get('search/text')
  @UsePipes(new ValidationPipe())
  async searchByText(@Query() query: SearchByTextDto, @Res() res: Response) {
    const { searchText } = query;
    const response = await this.roomListingService.searchByText(searchText);
    return res.status(statusCodes.OK).json({
      message: 'Search results',
      code: statusCodes.OK,
      data: response,
    });
  }

  @Get('search/geolocation')
  @UsePipes(new ValidationPipe())
  async searchByGeolocation(
    @Query() query: SearchByGeolocationDto,
    @Res() res: Response,
  ) {
    const { lat, lng, radius } = query;
    const response = await this.roomListingService.searchByGeolocation(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : 100,
    );
    return res.status(statusCodes.OK).json({
      message: 'Search results',
      code: statusCodes.OK,
      data: response,
    });
  }

  @Get('search/filters')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchByFilters(@Query() query: SearchByFiltersDto) {
    const {
      minPrice,
      maxPrice,
      rentSchedule,
      bedrooms,
      bathrooms,
      roomType,
      amenities,
      page,
      limit,
    } = query;

    const priceRange = {
      min: minPrice ? parseFloat(minPrice) : 0,
      max: maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER,
    };

    return this.roomListingService.searchByFilters(
      priceRange,
      rentSchedule,
      bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms ? parseInt(bathrooms, 10) : undefined,
      roomType,
      amenities,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
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
