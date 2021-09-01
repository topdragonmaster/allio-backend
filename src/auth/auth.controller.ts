import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AwsCognitoErrorCode } from './errorCode.enum';
import {
  AuthenticateRequestDTO,
  RegisterRequestDTO,
  ConfirmRegistrationRequestDTO,
  GeneralIdentityRequestDTO,
  ChangePasswordRequestDTO,
  ResetPasswordRequestDTO,
} from './types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(private readonly authService: AuthService) {
    this.logger = new Logger(AuthController.name);
  }

  @Post('register')
  async register(@Body() registerRequest: RegisterRequestDTO) {
    try {
      return await this.authService.registerUser(registerRequest);
    } catch (err) {
      this.logger.debug(this.register.name, err);
      throw new BadRequestException(err.message);
    }
  }

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

  @Post('confirm')
  async confirm(@Body() validateRequest: ConfirmRegistrationRequestDTO) {
    try {
      return await this.authService.confirmRegistration(validateRequest);
    } catch (err) {
      this.logger.debug(this.confirm.name, err);
      throw new BadRequestException(err.message);
    }
  }

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

  @Put('password')
  async changePassword(
    @Body() { identity, oldPassword, newPassword }: ChangePasswordRequestDTO
  ) {
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

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordRequest: ResetPasswordRequestDTO) {
    try {
      return await this.authService.resetPassword(resetPasswordRequest);
    } catch (err) {
      this.logger.debug(this.resetPassword.name, err);
      throw new BadRequestException(err.message);
    }
  }

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
