import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { NO_JWT } from './decorator/nonJwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isNonJwt = this.reflector.getAllAndOverride<boolean>(NO_JWT, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isNonJwt) {
      return true;
    }

    return super.canActivate(context);
  }
}
