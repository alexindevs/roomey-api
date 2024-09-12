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
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoommateListingService } from './roommate-listing.service';
import {
  CreateRoommateListingDto,
  UpdateRoommateListingDto,
} from './roommate-listing.dto';

@Controller('roommate-listings')
export class RoommateListingController {
  constructor(
    private readonly roommateListingService: RoommateListingService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createRoommateListingDto: CreateRoommateListingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    createRoommateListingDto.user_id = userId;
    return this.roommateListingService.create(createRoommateListingDto);
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
