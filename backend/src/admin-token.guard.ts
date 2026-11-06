import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth/admin-auth.service';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    const providedToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';

    if (!this.adminAuthService.isValidToken(providedToken)) {
      throw new UnauthorizedException('A valid bearer token is required.');
    }
    return true;
  }
}
