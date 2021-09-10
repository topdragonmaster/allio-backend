import { Injectable } from '@nestjs/common';
import { AuthConfig } from './auth.config';
import { Logger } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import {
  AuthenticateRequestDTO,
  RegisterRequestDTO,
  ConfirmRegistrationRequestDTO,
  GeneralIdentityRequestDTO,
  ChangePasswordRequestDTO,
  ResetPasswordRequestDTO,
  RequestUserInfo,
} from './types';
import { promisify } from 'util';

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
    phone_number,
    ...userInfo
  }: RegisterRequestDTO) {
    const extractedUserInfo: Omit<
      RegisterRequestDTO,
      'password' | 'phone_number'
    > & { phone_number?: string } = userInfo;
    if (phone_number) {
      extractedUserInfo.phone_number = `+${phone_number}`;
    }
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

    return promisify(user.confirmRegistration.bind(user))(code, true);
  }

  async resendConfirmationCode({ identity }: GeneralIdentityRequestDTO) {
    const user = this.getUser(identity);

    return promisify(user.resendConfirmationCode.bind(user))();
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
    return promisify(user.changePassword.bind(user))(oldPassword, newPassword);
  }

  async forgotPassword({ identity }: GeneralIdentityRequestDTO) {
    const user = this.getUser(identity);
    return new Promise<any>((resolve, reject) => {
      user.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async resetPassword({
    identity,
    code,
    newPassword,
  }: ResetPasswordRequestDTO) {
    const user = this.getUser(identity);
    return new Promise<string>((resolve, reject) => {
      user.confirmPassword(code, newPassword, {
        onSuccess: (message) => resolve(message),
        onFailure: (err) => reject(err),
      });
    });
  }

  async deleteAccount(deleteAccountRequest: AuthenticateRequestDTO) {
    const { user } = await this.authenticateUser(deleteAccountRequest);
    return promisify(user.deleteUser.bind(user))();
  }

  async signOut(user: CognitoUser) {
    return promisify(user.signOut.bind(user))();
  }

  async signOutEverywhere(user: CognitoUser) {
    return new Promise<string>((resolve, reject) => {
      user.globalSignOut({
        onSuccess: (message) => {
          resolve(message);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
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
}
