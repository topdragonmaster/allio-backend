import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { AppService } from './app.service';
import { CheckPolicies } from './auth/decorator/checkPolicies';
import { PoliciesGuard } from './auth/policies.guard';
import { Action } from './auth/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(PoliciesGuard)
  @Get()
  getHello(): string {
    return this.appService.getString('Hello World!');
  }

  @ApiBearerAuth()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.MODIFY, CognitoUserPool))
  @Get('admin')
  getRoot(): string {
    return this.appService.getString('Access as admin!');
  }
}
