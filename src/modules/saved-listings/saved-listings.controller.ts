import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { SavedListingsService } from './saved-listings.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@Controller('saved-listings')
export class SavedListingsController {
  constructor(private readonly savedListingsService: SavedListingsService) {}

  // Get all saved rooms for a user
  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  async findUserSavedRooms(@Req() req: any) {
    try {
      const savedRooms = await this.savedListingsService.findUserSavedRooms(
        req.user.userId,
      );
      if (!savedRooms) {
        throw new NotFoundException('No saved rooms found');
      }
      return { success: true, data: savedRooms };
    } catch (error) {
      throw new HttpException(
        'Error fetching saved rooms',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add a room to the user's saved rooms
  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  async addUserSavedRoom(@Req() req: any, @Body('roomId') roomId: string) {
    try {
      const savedRooms = await this.savedListingsService.addUserSavedRooms(
        req.user.userId,
        roomId,
      );
      return { success: true, data: savedRooms };
    } catch (error) {
      throw new HttpException(
        'Error saving room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete a room from the user's saved rooms
  @Delete('rooms/:roomId')
  @UseGuards(JwtAuthGuard)
  async deleteUserSavedRoom(@Req() req: any, @Param('roomId') roomId: string) {
    try {
      const deletedRoom = await this.savedListingsService.deleteUserSavedRooms(
        req.user.userId,
        roomId,
      );
      if (!deletedRoom) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Room deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Error deleting saved room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('roommates')
  @UseGuards(JwtAuthGuard)
  async addUserSavedRoommate(
    @Req() req: any,
    @Body('roommateId') roommateId: string,
  ) {
    try {
      const userId = req.user.userId; // Extract userId from the request
      const savedRoommates =
        await this.savedListingsService.addUserSavedRoommates(
          userId,
          roommateId,
        );
      return { success: true, data: savedRoommates };
    } catch (error) {
      throw new HttpException(
        'Error saving roommate',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete a roommate from the user's saved roommates
  @Delete('roommates/:roommateId')
  @UseGuards(JwtAuthGuard)
  async deleteUserSavedRoommate(
    @Req() req: any,
    @Param('roommateId') roommateId: string,
  ) {
    try {
      const userId = req.user.userId; // Extract userId from the request
      const deletedRoommate =
        await this.savedListingsService.deleteUserSavedRoommates(
          userId,
          roommateId,
        );
      if (!deletedRoommate) {
        throw new NotFoundException('Roommate not found');
      }
      return { success: true, message: 'Roommate deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Error deleting saved roommate',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
