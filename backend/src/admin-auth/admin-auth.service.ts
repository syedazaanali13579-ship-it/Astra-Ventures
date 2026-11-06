import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

@Injectable()
export class AdminAuthService {
  login(email: string, password: string): { accessToken: string; tokenType: 'Bearer'; expiresIn: number } {
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredEmail || !configuredPassword) {
      throw new UnauthorizedException('Admin login is not configured.');
    }

    if (!constantTimeEqual(email.trim().toLowerCase(), configuredEmail.trim().toLowerCase()) ||
        !constantTimeEqual(password, configuredPassword)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const secret = this.getSigningSecret();
    const payload = Buffer.from(JSON.stringify({
      sub: configuredEmail.trim().toLowerCase(),
      exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    })).toString('base64url');
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');

    return {
      accessToken: `${payload}.${signature}`,
      tokenType: 'Bearer',
      expiresIn: TOKEN_LIFETIME_SECONDS,
    };
  }

  isValidToken(token: string): boolean {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra !== undefined) return false;

    const expected = createHmac('sha256', this.getSigningSecret()).update(payload).digest();
    let provided: Buffer;
    try {
      provided = Buffer.from(signature, 'base64url');
    } catch {
      return false;
    }
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return false;

    try {
      const claims: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (!claims || typeof claims !== 'object') return false;
      const subject = (claims as { sub?: unknown }).sub;
      const expiration = (claims as { exp?: unknown }).exp;
      return typeof subject === 'string' &&
        typeof expiration === 'number' &&
        expiration > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  private getSigningSecret(): string {
    const secret = process.env.ADMIN_TOKEN_SECRET ?? process.env.ADMIN_TOKEN;
    if (!secret) throw new UnauthorizedException('Admin token signing is not configured.');
    return secret;
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
