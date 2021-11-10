import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  USER_ASSET_CLASS_CHANGED,
  UserAssetClassChangedEvent,
} from '../../user-asset-class/events';
import { UserRecommendedPortfolioService } from '../userRecommendedPortfolio.service';
import {
  USER_MANAGEMENT_WORKFLOW_CHANGED,
  UserManagementWorkflowChangedEvent,
} from '../../user-management-workflow/events';
import { ManagementWorkflowKey } from '../../management-workflow/entities/managementWorkflow.entity';
import { UserAssetClassService } from '../../user-asset-class/userAssetClass.service';

@Injectable()
export class UserRecommendedPortfolioListener {
  public constructor(
    private readonly userRecommendedPortfolioService: UserRecommendedPortfolioService,
    private readonly userAssetClassService: UserAssetClassService
  ) {}

  @OnEvent(USER_ASSET_CLASS_CHANGED)
  public async handleAssetClassChangedEvent(
    payload: UserAssetClassChangedEvent
  ): Promise<void> {
    return await this.userRecommendedPortfolioService.setRecommendedPortfolio(
      payload.userId
    );
  }

  @OnEvent(USER_MANAGEMENT_WORKFLOW_CHANGED)
  public async handleManagementWorkflowChangedEvent(
    payload: UserManagementWorkflowChangedEvent
  ): Promise<void> {
    const { userId, currentManagementWorkflow, previousManagementWorkflow } =
      payload;
    if (
      currentManagementWorkflow.key === ManagementWorkflowKey.Full ||
      previousManagementWorkflow?.key === ManagementWorkflowKey.Self
    ) {
      await this.userAssetClassService.setDefaultAssetClassList(userId);
    } else if (currentManagementWorkflow.key === ManagementWorkflowKey.Self) {
      await this.userAssetClassService.cleanUpUserAssetClassList(userId);
    }

    return await this.userRecommendedPortfolioService.setRecommendedPortfolio(
      userId
    );
  }
}
