import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from '../authentication.schema';
import * as jwt from 'jsonwebtoken';
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
    console.log(userId);
    const token = jwt.sign({ userId: userId }, this.secret, {
      expiresIn: '14d',
    });
    await this.refreshTokenModel.create({
      token,
      userId,
    });

    return true;
  }

  async checkTokenValidity(userId: string): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const tokenDoc = await this.refreshTokenModel.findOne({
      userId: userId,
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
        userId: userId,
      });
      if (!tokenDoc) {
        await this.addNewToken(userId);
        return {
          message: 'Token Added Successfully',
          code: statusCodes.CREATED,
          data: null,
        };
      }
      const token = jwt.sign({ userId: userId }, this.secret, {
        expiresIn: '14d',
      });
      await this.refreshTokenModel.updateOne(
        { userId: userId },
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
      userId: userId,
    });
    if (!tokenDoc) {
      return {
        code: statusCodes.NOT_FOUND,
        message: 'User ID not valid',
        data: null,
      };
    }
    await this.refreshTokenModel.findOneAndDelete({ userId: userId });
    return {
      code: statusCodes.OK,
      message: 'Logged out Successfully, please login again.',
      data: null,
    };
  }
}
