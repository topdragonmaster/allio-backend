import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserFundingMethodResolver } from './userFundingMethod.resolver';

@Module({
  imports: [AuthModule],
  providers: [UserFundingMethodResolver],
  exports: [],
})
export class UserFundingMethodModule {}
