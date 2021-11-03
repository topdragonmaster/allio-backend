import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  VerifyPhoneRequestDTO,
  SetAttributesDTO,
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
      return { user: this.authService.extractUserData(session) };
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
      await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId,
      });
    }

    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });
      return await this.authService.getUserAttributes(user);
    } catch (err) {
      this.logger.debug(this.getUserInfo.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Post('set-user-info')
  async setUserInfo(
    @Body() { userId, attributes, ...userTokens }: SetAttributesDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (userId) {
      await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId,
      });
    }

    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });
      return await this.authService.setUserAttributes(user, attributes);
    } catch (err) {
      this.logger.debug(this.setUserInfo.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({
    summary:
      "confirm user's identity to complete registration; identity can be email or phone",
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
      "resend confirmation code to user's identity to complete registration; identity can be email or phone",
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

  @ApiOperation({
    summary:
      "send confirmation code to user's registered phone after registration is confirmed",
  })
  @ApiBearerAuth()
  @Post('resend-phone')
  async resendPhone(
    @Body() { userId: optionalUserId, ...userTokens }: RestoreUserDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (optionalUserId) {
      await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId: optionalUserId,
      });
    }

    const userId = optionalUserId || requestUser.uuid;

    try {
      const user = this.authService.getSignedInUser({ userId, ...userTokens });
      return await this.authService.getAttributeVerificationCode({ user });
    } catch (err) {
      this.logger.debug(this.resendPhone.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({
    summary:
      "verify confirmation code to user's registered phone after registration is confirmed",
  })
  @ApiBearerAuth()
  @Post('verify-phone')
  async verifyPhone(
    @Body()
    { userId: optionalUserId, code, ...userTokens }: VerifyPhoneRequestDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    if (optionalUserId) {
      await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId: optionalUserId,
      });
    }

    const userId = optionalUserId || requestUser.uuid;

    try {
      const user = this.authService.getSignedInUser({ userId, ...userTokens });
      return await this.authService.verifyAttribute({ user, code });
    } catch (err) {
      this.logger.debug(this.verifyPhone.name, err);
      if (err.code === AwsCognitoErrorCode.NotAuthorizedException) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }

  @ApiBearerAuth()
  @Put('password')
  async changePassword(
    @Body() { userId, oldPassword, newPassword }: ChangePasswordRequestDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    await this.authService.checkCanAccessCognitoUser({
      requestUser,
      userId,
    });

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

  @ApiBearerAuth()
  @Delete('delete-account')
  async deleteAccount(
    @Body() { userId, ...userTokens }: RestoreUserDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    try {
      const user = this.authService.getSignedInUser({
        userId: userId || requestUser.uuid,
        ...userTokens,
      });
      return await this.authService.deleteAccount(user);
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
    {
      userId: optionalUserId,
      phone_number: phoneNumber,
      ...userTokens
    }: SetSmsMfaRequestDTO,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    const userId = optionalUserId || requestUser.uuid;
    await this.authService.checkCanAccessCognitoUser({
      requestUser,
      userId,
      action: Action.MODIFY,
    });

    try {
      const user = this.authService.getSignedInUser({
        userId,
        ...userTokens,
      });

      return await this.authService.setMfaPreference({
        user,
        settings: { sms: 'preferred' },
        phoneNumber,
      });
    } catch (err) {
      this.logger.debug(this.setSmsMfa.name, err);
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
      await this.authService.checkCanAccessCognitoUser({
        requestUser,
        userId,
      });
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
      return this.authService.extractUserData(session);
    } catch (err) {
      this.logger.debug(this.refresh.name, err);
      throw new BadRequestException(err.message);
    }
  }
}
