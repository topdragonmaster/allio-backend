import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestObject } from '../shared/types';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_POLICIES } from './decorator/checkPolicies';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PolicyHandler } from './types';

@Injectable()
export class PoliciesGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const policyHandlers =
      this.reflector.getAllAndMerge<PolicyHandler[]>(CHECK_POLICIES, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (policyHandlers.length) {
      const req = context.switchToHttp().getRequest<RequestObject>();

      const ability = await this.caslAbilityFactory.createForRequestUser({
        requestUser: req.user,
      });

      const result = policyHandlers.every(
        this.caslAbilityFactory.execPolicyHanlerFactory(ability, context)
      );

      if (!result) {
        return false;
      }
    }

    return true;
  }
}
