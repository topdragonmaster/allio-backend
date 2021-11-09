import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  USER_ASSET_CLASS_CHANGED,
  UserAssetClassChangedEvent,
} from '../../user-asset-class/events';
import { UserRecommendedPortfolioService } from '../userRecommendedPortfolio.service';

@Injectable()
export class UserRecommendedPortfolioListener {
  public constructor(
    private readonly userRecommendedPortfolioService: UserRecommendedPortfolioService
  ) {}

  @OnEvent(USER_ASSET_CLASS_CHANGED)
  public async handleAssetClassChangedEvent(
    payload: UserAssetClassChangedEvent
  ): Promise<void> {
    return await this.userRecommendedPortfolioService.setRecommendedPortfolio(
      payload.userId
    );
  }
}
