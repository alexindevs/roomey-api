import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../authentication.schema';
import jwt, { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AccessTokenService {
  private readonly secret: string;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    this.secret = process.env.JWT_SECRET || 'wahala';
  }

  generateAccessToken(user: UserDocument): string {
    const { _id } = user;
    const accessToken = jwt.sign(
      { userId: _id, email: user.email, role: user.role },
      this.secret,
      { expiresIn: '1d' },
    );
    return accessToken;
  }

  async getUserFromToken(token: string): Promise<UserDocument> {
    const { payload } = this.verifyAccessToken(token);
    const user = await this.userModel.findOne({ _id: payload.userId });
    return user;
  }

  verifyAccessToken(token: string): {
    isValid: boolean;
    payload?:
      | ({ userId: string; email: string; role: string } & JwtPayload)
      | string
      | any;
  } {
    try {
      const payload = jwt.verify(token, this.secret) as {
        userId: string;
        email: string;
        role: string;
      } & JwtPayload;
      return { isValid: true, payload };
    } catch (error) {
      const payload = jwt.decode(token);
      return { isValid: false, payload };
    }
  }
}
