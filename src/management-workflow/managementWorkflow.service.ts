import { Injectable } from '@nestjs/common';
import { GetManagementWorkflowArgs } from './dto/getManagementWorkflow.args';
import { ManagementWorkflow } from './entities/managementWorkflow.entity';
import { FilterQuery } from '@mikro-orm/core/typings';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { NotFoundError } from '../shared/errors';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class ManagementWorkflowService {
  public constructor(
    @InjectRepository(ManagementWorkflow)
    private readonly managementWorkflowRepo: EntityRepository<ManagementWorkflow>
  ) {}

  public async getManagementWorkflowList(
    args: GetManagementWorkflowArgs
  ): Promise<ManagementWorkflow[]> {
    const { idList } = args;
    const filterById = idList && idList.length > 0;
    const where: FilterQuery<ManagementWorkflow> = filterById
      ? { id: { $in: idList } }
      : {};

    const managementWorkflowList = await this.managementWorkflowRepo.find(
      where,
      {
        orderBy: {
          createdAt: QueryOrder.ASC,
        },
      }
    );

    if (filterById && managementWorkflowList.length !== idList.length) {
      const missingWorkflowId = idList.find(
        (id) => !managementWorkflowList.some((asset) => asset.id === id)
      );
      throw new NotFoundError('Management workflow not found', {
        managementWorkflowId: missingWorkflowId,
      });
    }

    return managementWorkflowList;
  }
}
