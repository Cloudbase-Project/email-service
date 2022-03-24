import { Injectable, Logger } from '@nestjs/common';
import { Password } from './utils/password';
import { JWT } from './utils/token';
import { GoogleOAuth } from './utils/GoogleOAuth';

@Injectable()
export class authService {
  private readonly logger = new Logger('userService');

  constructor(
    public Password: Password,
    public Token: JWT,
    public GoogleOAuth: GoogleOAuth,
  ) {}
}
