import { ApiProperty } from '@nestjs/swagger';
import { Ability } from '@casl/ability';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { ExecutionContext } from '@nestjs/common';
import { UserInvestmentQuestionnaireAnswer } from '../user-investment-questionnaire/userInvestmentQuestionnaireAnswer.entity';
import { UserRiskLevel } from '../risk-level/entities/userRiskLevel.entity';
import { UserAssetClass } from '../user-asset-class/entities/userAssetClass.entity';
import { UserManagementWorkflow } from '../user-management-workflow/entities/userManagementWorkflow.entity';
import { UserInvestmentValue } from '../investment-value/entities/userInvestmentValue.entity';
import { InvestmentValue } from '../investment-value/entities/investmentValue.entity';

export class RegisterRequestDTO {
  @ApiProperty({
    example: 'John',
    description: 'nickname, optional',
    required: false,
  })
  nickname?: string;

  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'A email is required for login',
  })
  email: string;

  @ApiProperty({
    example: 'password',
    description:
      'The password must include an Uppercase letter, a lowercase letter, a number and a special character.',
  })
  password: string;

  @ApiProperty({
    example: '+1415000000',
    description: 'phone number with the plus sign, optional',
    required: false,
  })
  phone_number?: string;
}

export class AuthenticateRequestDTO {
  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'email or phone number for login',
  })
  identity: string;

  @ApiProperty({
    example: 'password',
    description: 'password',
  })
  password: string;
}

export class ConfirmRegistrationRequestDTO {
  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'email or phone number for login',
  })
  identity: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code',
  })
  code: string;
}

export class GeneralIdentityRequestDTO {
  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'email or phone number or user id',
  })
  identity: string;
}

export class GeneralUserIdRequestDTO {
  @ApiProperty({
    example: 'b8dd9d97-37da-44cb-9e9f-96da62f6d415',
    description: 'AWS Cognito user id',
  })
  userId: string;
}

export class OptionalUserIdRequestDTO {
  @ApiProperty({
    example: 'b8dd9d97-37da-44cb-9e9f-96da62f6d415',
    description: 'AWS Cognito user id',
    required: false,
  })
  userId?: string;
}

export class ChangePasswordRequestDTO extends GeneralUserIdRequestDTO {
  @ApiProperty({
    example: 'oldPassword',
    description: 'old password',
  })
  oldPassword: string;

  @ApiProperty({
    example: 'newPassword',
    description: 'new password',
  })
  newPassword: string;
}

export class ResetPasswordRequestDTO {
  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'email or phone number for login',
  })
  identity: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code',
  })
  code: string;

  @ApiProperty({
    example: 'newPassword',
    description: 'new password',
  })
  newPassword: string;
}

export class RefreshRequestDTO {
  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito refresh token',
  })
  refreshToken: string;
}

export class TokenResponseDTO {
  @ApiProperty({
    example: 'b8dd9d97-37da-44cb-9e9f-96da62f6d415',
    description: 'AWS Cognito user id',
  })
  userId: string;

  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito id token',
  })
  idToken: string;

  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito refresh token',
  })
  refreshToken: string;
}

export class CodeDeliveryDetailsDTO {
  @ApiProperty({
    example: 'email',
    description: 'attribute name',
  })
  attributeName: string;

  @ApiProperty({
    example: 'EMAIL',
    description: 'delivery medium',
  })
  deliveryMedium: string;

  @ApiProperty({
    example: 'j***@e***.com',
    description: 'destination',
  })
  destination: string;
}

export class RestoreUserDTO extends OptionalUserIdRequestDTO {
  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito id token',
  })
  idToken: string;

  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ',
    description: 'AWS Cognito refresh token',
    required: false,
  })
  refreshToken?: string;
}

export class SetSmsMfaRequestDTO extends RestoreUserDTO {
  @ApiProperty({
    example: '+1415000000',
    description: 'phone number with the plus sign, optional',
    required: false,
  })
  phone_number?: string;
}

export enum Action {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ACCESS = 'access',
  MODIFY = 'modify',
}

export type Subjects =
  | typeof CognitoUserPool
  | CognitoUserPool
  | typeof UserInvestmentQuestionnaireAnswer
  | UserInvestmentQuestionnaireAnswer
  | typeof UserRiskLevel
  | UserRiskLevel
  | typeof UserAssetClass
  | UserAssetClass
  | typeof UserManagementWorkflow
  | UserManagementWorkflow
  | typeof UserInvestmentValue
  | InvestmentValue
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

type PolicyHandlerCallback = (
  ability: AppAbility,
  context: ExecutionContext
) => boolean;

interface PolicyHandlerObject {
  handle: PolicyHandlerCallback;
}

export type PolicyHandler = PolicyHandlerObject | PolicyHandlerCallback;

export interface RequestUserInfo {
  uuid: string;
  identity: string;
  roles: Roles[];
}

export enum Roles {
  ADMIN = 'Admin',
}

export interface SetMfaPreferenceProps {
  user: CognitoUser;
  settings?: {
    sms?: boolean | 'preferred';
    totp?: boolean | 'preferred';
  };
  phoneNumber?: string;
}
