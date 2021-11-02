import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedConfig {
  private readonly allioEnv: string;

  constructor(private readonly configService: ConfigService) {
    this.allioEnv = this.configService.get('ALLIO_ENV');
  }

  public get isDev() {
    return this.allioEnv === 'dev';
  }

  public getUserId(): string {
    if (this.isDev) {
      return 'f6494e68-3ce7-4cf4-98c3-b2f941526990';
    }

    return null;
  }
}
