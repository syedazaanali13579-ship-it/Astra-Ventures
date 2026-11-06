import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class AdminAuthService {
  isValidToken(token: string): boolean {
    const configuredToken = process.env.ADMIN_ACCESS_TOKEN;
    if (!configuredToken || !token) return false;
    const expected = Buffer.from(configuredToken);
    const provided = Buffer.from(token);
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  }
}
