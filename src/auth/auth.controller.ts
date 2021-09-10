import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Logger,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { RequestObject } from '../shared/types';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { NoJwt } from './decorator/noJwt';
import { AwsCognitoErrorCode } from './errorCode.enum';
import { PoliciesGuard } from './policies.guard';
import {
  AuthenticateRequestDTO,
  RegisterRequestDTO,
  ConfirmRegistrationRequestDTO,
  GeneralIdentityRequestDTO,
  ChangePasswordRequestDTO,
  ResetPasswordRequestDTO,
  Action,
} from './types';

@UseGuards(PoliciesGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(
    private readonly authService: AuthService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {
    this.logger = new Logger(AuthController.name);
  }

  @NoJwt()
  @Post('register')
  async register(@Body() registerRequest: RegisterRequestDTO) {
    try {
      return await this.authService.registerUser(registerRequest);
    } catch (err) {
      this.logger.debug(this.register.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('login')
  async login(@Body() authenticateRequest: AuthenticateRequestDTO) {
    try {
      return await this.authService.authenticateUser(authenticateRequest);
    } catch (err) {
      this.logger.debug(this.login.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('confirm')
  async confirm(@Body() validateRequest: ConfirmRegistrationRequestDTO) {
    try {
      return await this.authService.confirmRegistration(validateRequest);
    } catch (err) {
      this.logger.debug(this.confirm.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('resend')
  async resend(
    @Body() resendConfirmationCodeRequest: GeneralIdentityRequestDTO
  ) {
    try {
      return await this.authService.resendConfirmationCode(
        resendConfirmationCodeRequest
      );
    } catch (err) {
      this.logger.debug(this.resend.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Put('password')
  async changePassword(
    @Body() { identity, oldPassword, newPassword }: ChangePasswordRequestDTO,
    @Request() req: RequestObject
  ) {
    const ability = await this.caslAbilityFactory.createForRequestUser({
      requestUser: req.user,
      isMatchedUser: identity === req.user?.identity,
    });
    const canChangePassword = ability.can(Action.MODIFY, CognitoUserPool);

    if (!canChangePassword) {
      throw new ForbiddenException();
    }

    try {
      const { user } = await this.authService.authenticateUser({
        identity,
        password: oldPassword,
      });
      return await this.authService.changePassword({
        user,
        oldPassword,
        newPassword,
      });
    } catch (err) {
      this.logger.debug(this.changePassword.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('forget-password')
  async forgetPassword(
    @Body() forgetPasswordRequest: GeneralIdentityRequestDTO
  ) {
    try {
      return await this.authService.forgotPassword(forgetPasswordRequest);
    } catch (err) {
      this.logger.debug(this.forgetPassword.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordRequest: ResetPasswordRequestDTO) {
    try {
      return await this.authService.resetPassword(resetPasswordRequest);
    } catch (err) {
      this.logger.debug(this.resetPassword.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Delete('delete-account')
  async deleteAccount(@Body() deleteAccountRequest: AuthenticateRequestDTO) {
    try {
      return await this.authService.deleteAccount(deleteAccountRequest);
    } catch (err) {
      this.logger.debug(this.deleteAccount.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('logout')
  async logout(@Body() logoutRequest: AuthenticateRequestDTO) {
    try {
      const { user } = await this.authService.authenticateUser(logoutRequest);
      return await this.authService.signOutEverywhere(user);
    } catch (err) {
      this.logger.debug(this.logout.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }
}
