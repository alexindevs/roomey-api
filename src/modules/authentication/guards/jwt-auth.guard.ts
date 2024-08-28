import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AccessTokenService } from '../tokens/accesstoken.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateRequest(request);
  }

  private async validateRequest(request: Request): Promise<boolean> {
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
}

export interface IRequest extends Request {
  user: {
    userId: string;
    identifier: string;
    role: string;
  };
}
