import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  createAliasResolver,
  ExtractSubjectType,
} from '@casl/ability';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import {
  Action,
  AppAbility,
  PolicyHandler,
  RequestUserInfo,
  Roles,
  Subjects,
} from './types';

const resolveAction = createAliasResolver({
  [Action.MODIFY]: [Action.UPDATE, Action.DELETE],
  [Action.ACCESS]: [Action.READ, Action.MODIFY],
}) as (action: Action | Action[]) => Action | Action[];

@Injectable()
export class CaslAbilityFactory {
  async createForRequestUser({
    requestUser,
    isMatchedUser,
  }: {
    requestUser: RequestUserInfo;
    isMatchedUser?: boolean;
  }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    );

    const isAdmin = requestUser?.roles.some((role) => role === Roles.ADMIN);

    if (isAdmin) {
      // for admin user
      can(Action.MANAGE, 'all');
    } else if (isMatchedUser !== false) {
      // for non-admin and non-not-matched user
      cannot(Action.DELETE, 'all');
      can(Action.READ, 'all');
      if (isMatchedUser === true) {
        // for matched user
        can(Action.MODIFY, CognitoUserPool);
      }
    }

    return build({
      resolveAction,
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  execPolicyHandler({
    handler,
    ability,
    context,
  }: {
    handler: PolicyHandler;
    ability: AppAbility;
    context: ExecutionContext;
  }) {
    if (typeof handler === 'function') {
      return handler(ability, context);
    }
    return handler.handle(ability, context);
  }

  execPolicyHanlerFactory(ability: AppAbility, context: ExecutionContext) {
    return (handler: PolicyHandler) =>
      this.execPolicyHandler({ handler, ability, context });
  }
}