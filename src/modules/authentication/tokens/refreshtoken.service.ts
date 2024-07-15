import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from '../authentication.schema';
import jwt from 'jsonwebtoken';
import { statusCodes } from 'src/shared/constants';

@Injectable()
export class RefreshTokenService {
  private readonly secret: string;

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {
    this.secret = process.env.JWT_SECRET || 'wahala';
  }

  async addNewToken(userId: Types.ObjectId): Promise<boolean> {
    const token = jwt.sign({ user_id: userId }, this.secret, {
      expiresIn: '14d',
    });
    await this.refreshTokenModel.create({
      token,
      user_id: userId,
    });

    return true;
  }

  async checkTokenValidity(userId: string): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const tokenDoc = await this.refreshTokenModel.findOne({
      user_id: userId,
    });

    try {
      jwt.verify(tokenDoc.token, this.secret);
      return {
        isValid: true,
        message: 'Refresh Token found and checked successfully',
      };
    } catch (error: any) {
      return {
        isValid: false,
        message: error.message,
      };
    }
  }

  async replaceToken(userId: Types.ObjectId) {
    try {
      const tokenDoc = await this.refreshTokenModel.findOne({
        user_id: userId,
      });
      if (!tokenDoc) {
        await this.addNewToken(userId);
        return {
          message: 'Token Added Successfully',
          code: statusCodes.CREATED,
          data: null,
        };
      }
      const token = jwt.sign({ user_id: userId }, this.secret, {
        expiresIn: '14d',
      });
      await this.refreshTokenModel.updateOne(
        { user_id: userId },
        { token: token },
      );
      return {
        message: 'Token Updated Successfully',
        code: statusCodes.OK,
        data: null,
      };
    } catch (error) {
      return {
        code: statusCodes.INTERNAL_SERVER_ERROR,
        error: 'Failed to update token',
      };
    }
  }

  async invalidateToken(userId: Types.ObjectId) {
    const tokenDoc = await this.refreshTokenModel.findOne({
      user_id: userId,
    });
    if (!tokenDoc) {
      return {
        code: statusCodes.NOT_FOUND,
        message: 'User ID not valid',
        data: null,
      };
    }
    await this.refreshTokenModel.findOneAndDelete({ user_id: userId });
    return {
      code: statusCodes.OK,
      message: 'Logged out Successfully, please login again.',
      data: null,
    };
  }
}
