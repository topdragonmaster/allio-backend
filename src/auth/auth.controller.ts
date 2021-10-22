import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Logger,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/currentUser';
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
  RefreshRequestDTO,
  RequestUserInfo,
  RestoreUserDTO,
  SetSmsMfaRequestDTO,
  Action,
} from './types';

@UseGuards(PoliciesGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(private readonly authService: AuthService) {
    this.logger = new Logger(AuthController.name);
  }

  @NoJwt()
  @Post('register')
  async register(@Body() registerRequest: RegisterRequestDTO) {
    try {
      const result = await this.authService.registerUser(registerRequest);
      return !!result.userSub;
    } catch (err) {
      this.logger.debug(this.register.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('login')
  async login(@Body() authenticateRequest: AuthenticateRequestDTO) {
    try {
      const { session } = await this.authService.authenticateUser(
        authenticateRequest
      );
      return this.authService.extractTokens(session);
    } catch (err) {
      this.logger.debug(this.login.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Post('get-user-info')
  async getUserInfo(
    @Body() { userId, ...userTokens }: RestoreUserDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (userId) {
      const canAccessUserInfo =
        await this.authService.checkCanAccessCognitoUser({
          requestUser,
          userId,
        });
      if (!canAccessUserInfo) {
        throw new ForbiddenException();
      }
    }

    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });
      return await this.authService.getUserAttributes(user);
    } catch (err) {
      this.logger.debug(this.logout.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({
    summary: "confirm on user's identity whether it is email or phone",
  })
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

  @ApiOperation({
    summary:
      "resend confirm code to user's identity whether it is email or phone",
  })
  @NoJwt()
  @Post('resend')
  async resend(
    @Body() resendConfirmationCodeRequest: GeneralIdentityRequestDTO
  ) {
    try {
      const codeDeliveryDetails = await this.authService.resendConfirmationCode(
        resendConfirmationCodeRequest
      );
      return this.authService.extractCodeDeliveryDetails(codeDeliveryDetails);
    } catch (err) {
      this.logger.debug(this.resend.name, err);
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Put('password')
  async changePassword(
    @Body() { userId, oldPassword, newPassword }: ChangePasswordRequestDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (userId) {
      const canChangePassword =
        await this.authService.checkCanAccessCognitoUser({
          requestUser,
          userId,
          action: Action.ACCESS,
        });
      if (!canChangePassword) {
        throw new ForbiddenException();
      }
    }

    try {
      const { user } = await this.authService.authenticateUser({
        identity: userId,
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
      const codeDeliveryDetails = await this.authService.forgotPassword(
        forgetPasswordRequest
      );
      return this.authService.extractCodeDeliveryDetails(codeDeliveryDetails);
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

  @ApiBearerAuth()
  @Post('set-sms-mfa')
  async setSmsMfa(
    @Body()
    { userId, phone_number: phoneNumber, ...userTokens }: SetSmsMfaRequestDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (userId) {
      const canSetSmsMfa = await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId,
        action: Action.MODIFY,
      });
      if (!canSetSmsMfa) {
        throw new ForbiddenException();
      }
    }

    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });

      return await this.authService.setMfaPreference({
        user,
        settings: { sms: 'preferred' },
        phoneNumber,
      });
    } catch (err) {
      this.logger.debug(this.logout.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(
    @Body() { userId, ...userTokens }: RestoreUserDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (userId) {
      const canLogOut = await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId,
        action: Action.ACCESS,
      });

      if (!canLogOut) {
        throw new ForbiddenException();
      }
    }

    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });
      return await this.authService.signOutEverywhere(user);
    } catch (err) {
      this.logger.debug(this.logout.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @NoJwt()
  @Post('refresh')
  async refresh(@Body() { refreshToken }: RefreshRequestDTO) {
    try {
      const session = await this.authService.refreshSession(refreshToken);
      return this.authService.extractTokens(session);
    } catch (err) {
      this.logger.debug(this.logout.name, err);
      throw new BadRequestException(err.message);
    }
  }
}
