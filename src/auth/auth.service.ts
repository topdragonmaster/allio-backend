import { Injectable } from '@nestjs/common';
import { AuthConfig } from './auth.config';
import { Logger } from '@nestjs/common';
import {
  AuthenticationDetails,
  CodeDeliveryDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
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
} from './types';
import { promisify } from 'util';

const SUCCESS = 'SUCCESS';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  private readonly userPool: CognitoUserPool;
  constructor(private readonly authConfig: AuthConfig) {
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

    return new Promise<{ user: CognitoUser; session: CognitoUserSession }>(
      (resolve, reject) => {
        user.authenticateUser(authenticationDetails, {
          onSuccess: (session) => {
            resolve({ user, session });
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      }
    );
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

  async getUserAttributes(user: CognitoUser) {
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

  async changePassword({
    user,
    oldPassword,
    newPassword,
  }: Omit<ChangePasswordRequestDTO, 'identity'> & { user: CognitoUser }) {
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

  async deleteAccount(deleteAccountRequest: AuthenticateRequestDTO) {
    const { user } = await this.authenticateUser(deleteAccountRequest);
    const result: string = await promisify(user.deleteUser.bind(user))();
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
      payload.token_use !== 'id' ||
      // must be an access token from the AWS Cognito
      this.authConfig.authority !== payload.iss ||
      // must be issued from the same AWS Cognito region
      this.authConfig.clientId !== payload.aud
      // must refer to the same AWS Cognito user pool
    ) {
      return;
    }
    return {
      uuid: payload?.sub,
      identity: payload?.email,
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

  extractTokens(session: CognitoUserSession): TokenResponseDTO {
    return {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
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
