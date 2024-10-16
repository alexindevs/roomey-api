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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        return this.validateHttpRequest(request);
      } else if (context.getType() === 'ws') {
        const client = context.switchToWs().getClient<Socket>();
        console.log('Client connected:', client.id);
        return this.validateWsRequest(client);
      }
      return false; // Default for unknown context
    } catch (error) {
      if (context.getType() === 'ws') {
        throw new WsException(error.message);
      }
      throw error; // For HTTP, we can throw the original error
    }
  }

  private async validateHttpRequest(request: Request): Promise<boolean> {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    return this.validateToken(token, (payload) => {
      request['user'] = payload;
    });
  }

  private async validateWsRequest(client: Socket): Promise<boolean> {
    const token = client.handshake.query.token as string;
    console.log('Token:', token);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    return this.validateToken(token, (payload) => {
      client['user'] = payload;
    });
  }

  private async validateToken(
    token: string,
    attachPayload: (payload: any) => void,
  ): Promise<boolean> {
    if (!this.accessTokenService) {
      throw new Error('AccessTokenService is undefined');
    }
    
    const { isValid, payload } = await this.accessTokenService.verifyAccessToken(token);
  
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }
  
    attachPayload(payload);
    return true;
  }
  
}
