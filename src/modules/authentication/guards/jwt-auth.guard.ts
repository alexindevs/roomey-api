import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenService } from '../tokens/accesstoken.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      return this.validateHttpRequest(request);
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      return this.validateWsRequest(client);
    }
    return false; // Default for unknown context
  }

  private async validateHttpRequest(request: Request): Promise<boolean> {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    const { isValid, payload } = this.accessTokenService.verifyAccessToken(token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    request['user'] = payload; // Attach the payload to the request object
    return true;
  }

  private async validateWsRequest(client: Socket): Promise<boolean> {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    const { isValid, payload } = this.accessTokenService.verifyAccessToken(token);

    if (!isValid) {
      throw new WsException('Invalid token');
    }

    client['user'] = payload; // Attach the payload to the client object
    return true;
  }
}
