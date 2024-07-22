import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoomListingService } from './room-listing.service';
import {
  CreateRoomListingDto,
  UpdateRoomListingDto,
  SearchByTextDto,
  SearchByGeolocationDto,
  SearchByFiltersDto,
  FindByUserIdDto,
} from './room-listing.dto';
import { Response } from 'express';
import { statusCodes } from 'src/shared/constants';

@Controller('room-listings')
export class RoomListingController {
  constructor(private readonly roomListingService: RoomListingService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createRoomListing(
    @Body() createRoomListingDto: CreateRoomListingDto,
    @Res() res: Response,
  ) {
    const response =
      await this.roomListingService.createRoomListing(createRoomListingDto);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const response = await this.roomListingService.findAll();
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: Response) {
    const response = await this.roomListingService.findById(id);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updateRoomListing(
    @Param('id') id: string,
    @Body() updateRoomListingDto: UpdateRoomListingDto,
    @Res() res: Response,
  ) {
    const response = await this.roomListingService.updateRoomListing(
      id,
      updateRoomListingDto,
    );
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Delete(':id')
  async deleteRoomListing(@Param('id') id: string, @Res() res: Response) {
    const response = await this.roomListingService.deleteRoomListing(id);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }

  @Get('search/text')
  @UsePipes(new ValidationPipe())
  async searchByText(@Query() query: SearchByTextDto, @Res() res: Response) {
    const { searchText } = query;
    const response = await this.roomListingService.searchByText(searchText);
    return res
      .status(statusCodes.OK)
      .json({ message: 'Search results', data: response });
  }

  @Get('search/geolocation')
  @UsePipes(new ValidationPipe())
  async searchByGeolocation(
    @Query() query: SearchByGeolocationDto,
    @Res() res: Response,
  ) {
    const { lat, lng, radius } = query;
    const response = await this.roomListingService.searchByGeolocation(
      lat,
      lng,
      radius,
    );
    return res
      .status(statusCodes.OK)
      .json({ message: 'Search results', data: response });
  }

  @Get('search/filters')
  @UsePipes(new ValidationPipe())
  async searchByFilters(
    @Query() query: SearchByFiltersDto,
    @Res() res: Response,
  ) {
    const { priceRange, bedrooms, bathrooms, amenities, moveInDate, keywords } =
      query;
    const response = await this.roomListingService.searchByFilters(
      priceRange,
      bedrooms,
      bathrooms,
      amenities,
      moveInDate,
      keywords,
    );
    return res
      .status(statusCodes.OK)
      .json({ message: 'Filtered search results', data: response });
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string, @Res() res: Response) {
    const response = await this.roomListingService.findByUserId(userId);
    return res
      .status(response.code)
      .json({ message: response.message, data: response.data });
  }
}
