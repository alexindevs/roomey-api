import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenService } from '../tokens/accesstoken.service';
import { User, UserDocument } from '../authentication.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();

    if (type === 'http') {
      // Handle HTTP requests
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];

      return this.validateToken(token, false); // false indicates HTTP context
    } else if (type === 'ws') {
      // Handle WebSocket connections
      const client = context.switchToWs().getClient();
      const token = client.handshake.headers.authorization?.split(' ')[1];

      return this.validateToken(token, true); // true indicates WebSocket context
    }

    return false; // Default to not allowing access if context is unknown
  }

  private async validateToken(
    token: string | undefined,
    isWs: boolean,
  ): Promise<boolean> {
    if (!token) {
      throw isWs
        ? new WsException('No token provided')
        : new UnauthorizedException('No token provided');
    }

    try {
      const { payload } = this.accessTokenService.verifyAccessToken(token);

      // Validate if user exists, is active, and not blacklisted
      const user = await this.userModel.findOne({ _id: payload.userId });

      if (!user) {
        throw isWs
          ? new WsException('User not found')
          : new UnauthorizedException('User not found');
      }

      if (!user.verified) {
        throw isWs
          ? new WsException('User not verified')
          : new UnauthorizedException('User not verified');
      }

      if (user.account_deactivated) {
        throw isWs
          ? new WsException('Account is deactivated')
          : new UnauthorizedException('Account is deactivated');
      }

      if (user.blacklisted) {
        throw isWs
          ? new WsException('User is blacklisted')
          : new UnauthorizedException('User is blacklisted');
      }

      return true;
    } catch (err) {
      throw isWs
        ? new WsException('Invalid or expired token')
        : new UnauthorizedException('Invalid or expired token');
    }
  }
}
