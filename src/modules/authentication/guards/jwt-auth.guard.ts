import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AccessTokenService } from '../tokens/accesstoken.service';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the request is from a WebSocket connection or an HTTP request
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      return this.validateHttpRequest(request);
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      return this.validateWsRequest(client);
    }
  }

  // Handle validation for HTTP requests
  private async validateHttpRequest(request: Request): Promise<boolean> {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    request['user'] = payload; // Attach the payload to the request object

    return true;
  }

  // Handle validation for WebSocket connections
  private async validateWsRequest(client: Socket): Promise<boolean> {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const { isValid, payload } =
      this.accessTokenService.verifyAccessToken(token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    client['user'] = payload; // Attach the payload to the client object

    return true;
  }
}
