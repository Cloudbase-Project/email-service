import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JWT } from 'src/auth/utils/token';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private Token: JWT) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = req.headers.owner as string;

    if (!token) {
      return false;
    }
    try {
      const { email, id } = this.Token.verifyToken(
        token,
        {},
        process.env.MAIN_SECRET_TOKEN,
      );
      req.ownerEmail = email;
      req.ownerId = id;
      req.isOwner = true;

      return true;
    } catch (err) {
      return false;
    }
  }
}
