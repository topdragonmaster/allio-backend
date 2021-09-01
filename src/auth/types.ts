import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDTO {
  @ApiProperty({
    example: 'John',
    description: 'A given name is required.',
  })
  given_name: string;

  @ApiProperty({
    example: 'Smith',
    description: 'A family name is required',
  })
  family_name: string;

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
    example: '1415000000',
    description: 'phone number that is after the plus sign',
  })
  phone_number?: number;
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
    description: 'email or phone number for login',
  })
  identity: string;
}

export class ChangePasswordRequestDTO {
  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'email or phone number for login',
  })
  identity: string;

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
