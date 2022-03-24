import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/payload';

@Injectable()
export class JWT {
  public config;
  constructor() {}

  newToken<T extends string | object | Buffer>(
    payload: T,
    jwtConfig = this.config,
  ): string {
    return jwt.sign(payload, process.env.JWT_SECRET, jwtConfig);
  }

  verifyToken<T extends string | object>(
    token: string,
    verifyOptions?: jwt.VerifyOptions,
    secret = process.env.JWT_SECRET,
  ) {
    return jwt.verify(token, secret, verifyOptions) as T;
  }
}
