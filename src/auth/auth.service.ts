import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthConfig } from './auth.config';
import { Logger } from '@nestjs/common';
import {
  AuthenticationDetails,
  CodeDeliveryDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IMfaSettings,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import {
  AuthenticateRequestDTO,
  RegisterRequestDTO,
  ConfirmRegistrationRequestDTO,
  GeneralIdentityRequestDTO,
  ChangePasswordRequestDTO,
  ResetPasswordRequestDTO,
  RequestUserInfo,
  TokenResponseDTO,
  CodeDeliveryDetailsDTO,
  RestoreUserDTO,
  SetMfaPreferenceProps,
  Action,
} from './types';
import { promisify } from 'util';
import { CaslAbilityFactory } from './casl-ability.factory';

const SUCCESS = 'SUCCESS';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  private readonly userPool: CognitoUserPool;
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {
    this.logger = new Logger(AuthService.name);
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    });
  }

  getUser(identity: string) {
    return new CognitoUser({
      Username: identity,
      Pool: this.userPool,
    });
  }

  getSignedInUser({
    userId,
    idToken,
    accessToken,
    refreshToken,
  }: RestoreUserDTO) {
    const user = this.getUser(userId);
    const session = new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: idToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: accessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken }),
    });
    user.setSignInUserSession(session);
    return user;
  }

  checkIsMatchedUser(requestUser: RequestUserInfo, userId: string) {
    return userId === requestUser.uuid;
  }

  async checkCanAccessCognitoUser({
    requestUser,
    userId,
    action = Action.ACCESS,
  }: {
    requestUser: RequestUserInfo;
    userId: string;
    action?: Action;
  }) {
    return await this.caslAbilityFactory.canAccessOrFail({
      requestUser,
      userId,
      action,
      subject: CognitoUserPool,
    });
  }

  async registerUser({
    password,
    ...userInfo
  }: RegisterRequestDTO): Promise<ISignUpResult> {
    const extractedUserInfo: Omit<RegisterRequestDTO, 'password'> = userInfo;
    const userAttributes = Object.entries(extractedUserInfo).map(
      ([Name, Value]) =>
        new CognitoUserAttribute({
          Name,
          Value,
        })
    );

    return promisify(this.userPool.signUp.bind(this.userPool))(
      userInfo.email,
      password,
      userAttributes,
      null
    );
  }

  async authenticateUser({ identity, password }: AuthenticateRequestDTO) {
    const authenticationDetails = new AuthenticationDetails({
      Username: identity,
      Password: password,
    });

    const user = this.getUser(identity);

    return new Promise<{
      user: CognitoUser;
      session?: CognitoUserSession;
      codeDeliveryDetails?: CodeDeliveryDetails;
    }>((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          resolve({ user, session });
        },
        onFailure: (err) => {
          reject(err);
        },
        mfaRequired: (codeDeliveryDetails) => {
          resolve({ user, codeDeliveryDetails });
        },
      });
    });
  }

  async confirmRegistration({ identity, code }: ConfirmRegistrationRequestDTO) {
    const user = this.getUser(identity);

    const result = await promisify(user.confirmRegistration.bind(user))(
      code,
      true
    );

    return result === SUCCESS;
  }

  async resendConfirmationCode({ identity }: GeneralIdentityRequestDTO) {
    const user = this.getUser(identity);

    const {
      CodeDeliveryDetails: codeDeliveryDetails,
    }: { CodeDeliveryDetails: CodeDeliveryDetails } = await promisify(
      user.resendConfirmationCode.bind(user)
    )();

    return codeDeliveryDetails;
  }

  async getUserAttributes(user: CognitoUser): Promise<Record<string, string>> {
    const userAttributes = await promisify<CognitoUserAttribute[]>(
      user.getUserAttributes.bind(user)
    )();

    return userAttributes.reduce<Record<string, string>>(
      (attributeObj, userAttribute) => ({
        ...attributeObj,
        [userAttribute.getName()]: userAttribute.getValue(),
      }),
      {}
    );
  }

  async setUserAttributes(
    user: CognitoUser,
    attributes: Record<string, string>
  ) {
    const userAttributes = Object.entries(attributes).map(
      ([Name, Value]) =>
        new CognitoUserAttribute({
          Name,
          Value,
        })
    );
    return promisify(user.updateAttributes.bind(user))(userAttributes);
  }

  async changePassword({
    user,
    oldPassword,
    newPassword,
  }: Omit<ChangePasswordRequestDTO, 'userId'> & { user: CognitoUser }) {
    const result = await promisify(user.changePassword.bind(user))(
      oldPassword,
      newPassword
    );
    return result === SUCCESS;
  }

  async forgotPassword({ identity }: GeneralIdentityRequestDTO) {
    const user = this.getUser(identity);
    const { CodeDeliveryDetails: codeDeliveryDetails } = await new Promise<{
      CodeDeliveryDetails: CodeDeliveryDetails;
    }>((resolve, reject) => {
      user.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
    return codeDeliveryDetails;
  }

  async resetPassword({
    identity,
    code,
    newPassword,
  }: ResetPasswordRequestDTO) {
    const user = this.getUser(identity);
    const result = await new Promise<string>((resolve, reject) => {
      user.confirmPassword(code, newPassword, {
        onSuccess: (message) => resolve(message),
        onFailure: (err) => reject(err),
      });
    });
    return result === SUCCESS;
  }

  async deleteAccount(user: CognitoUser) {
    const result: string = await promisify(user.deleteUser.bind(user))();
    return result === SUCCESS;
  }

  async setMfaPreference({
    user,
    settings: { sms, totp } = {},
    phoneNumber,
  }: SetMfaPreferenceProps) {
    const smsMfaSettings: IMfaSettings = sms && {
      PreferredMfa: sms === 'preferred',
      Enabled: true,
    };
    if (smsMfaSettings) {
      // if the user is trying to set up sms mfa
      const existingPhoneNumber = (await this.getUserAttributes(user))
        ?.phone_number;
      // check if there is an existing phone registered
      if (!existingPhoneNumber) {
        if (!phoneNumber) {
          // if no phone number is provided and no phone registered
          throw new BadRequestException('No phone is registered');
        }
        // if a phone number is provided and no phone previously registered
        // try to register the provided phone number
        await this.setUserAttributes(user, { phone_number: phoneNumber });
      }
      const attributes = await this.getUserAttributes(user);
      if (
        !attributes.phone_number_verified ||
        attributes.phone_number_verified === 'false'
      ) {
        // if no phone is verified
        throw new BadRequestException(
          'Please verify your phone number before enabling SMS MFA'
        );
      }
    }
    const softwareTokenMfaSettings: IMfaSettings = totp && {
      PreferredMfa: totp === 'preferred',
      Enabled: true,
    };
    const result: string = await promisify(
      user.setUserMfaPreference.bind(user)
    )(smsMfaSettings, softwareTokenMfaSettings);
    return result === SUCCESS;
  }

  async signOut(user: CognitoUser) {
    return promisify(user.signOut.bind(user))();
  }

  async signOutEverywhere(user: CognitoUser) {
    const result = await new Promise<string>((resolve, reject) => {
      user.globalSignOut({
        onSuccess: (message) => {
          resolve(message);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
    return result === SUCCESS;
  }

  async validateUserWithIdTokenPayload(
    payload: Record<string, any>
  ): Promise<RequestUserInfo> {
    if (
      // must be an id token from the AWS Cognito
      payload.token_use !== 'id' ||
      // must be issued from the same AWS Cognito region
      // (actually this is handled by jwt strategy already)
      this.authConfig.authority !== payload.iss ||
      // must refer to the same AWS Cognito user pool
      this.authConfig.clientId !== payload.aud
    ) {
      return;
    }
    return {
      uuid: payload?.sub,
      identity: payload?.email,
      roles: payload?.['cognito:groups'] ?? [],
    };
  }

  async validateUserWithAccessTokenPayload(
    payload: Record<string, any>
  ): Promise<RequestUserInfo> {
    if (
      // must be an access token from the AWS Cognito
      payload.token_use !== 'access' ||
      // must be issued from the same AWS Cognito region
      // (actually this is handled by jwt strategy already)
      this.authConfig.authority !== payload.iss ||
      // must refer to the same AWS Cognito user pool
      this.authConfig.clientId !== payload.client_id
    ) {
      return;
    }
    return {
      uuid: payload?.sub,
      identity: payload?.username,
      roles: payload?.['cognito:groups'] ?? [],
    };
  }

  async refreshSession(refreshToken: string): Promise<CognitoUserSession> {
    const cognitoRefreshToken = new CognitoRefreshToken({
      RefreshToken: refreshToken,
    });
    const cognitoUser = this.userPool.getCurrentUser();

    const refreshedSession = await promisify<
      (cognitoRefreshToken: CognitoRefreshToken) => Promise<CognitoUserSession>
    >(cognitoUser.refreshSession.bind(cognitoUser))(cognitoRefreshToken);

    return refreshedSession;
  }

  extractUserData(session: CognitoUserSession): TokenResponseDTO {
    const cognitoIdToken = session.getIdToken();
    return {
      idToken: cognitoIdToken.getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      userId: cognitoIdToken.payload?.sub,
    };
  }

  extractCodeDeliveryDetails({
    AttributeName: attributeName,
    DeliveryMedium: deliveryMedium,
    Destination: destination,
  }: CodeDeliveryDetails): CodeDeliveryDetailsDTO {
    return {
      attributeName,
      deliveryMedium,
      destination,
    };
  }
}
