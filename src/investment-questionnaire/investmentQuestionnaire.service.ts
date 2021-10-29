import { Injectable, Logger } from '@nestjs/common';
import {
  InvestmentQuestionnaire,
  InvestmentQuestionnaireCategory,
} from './investmentQuestionnaire.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FindOptions, QueryOrder } from '@mikro-orm/core';
import { GetAllQuestionnaireArgs } from './dto/getAllQuestionnaire.args';
import { BaseService } from '../shared/base.service';
import { QuestionnaireNotFound } from './utils/errors';

@Injectable()
export class InvestmentQuestionnaireService extends BaseService<InvestmentQuestionnaire> {
  protected readonly logger: Logger;
  public constructor(
    @InjectRepository(InvestmentQuestionnaire)
    private readonly investmentQuestionnaireRepo: EntityRepository<InvestmentQuestionnaire>
  ) {
    super(investmentQuestionnaireRepo);
    this.logger = new Logger(InvestmentQuestionnaireService.name);
  }

  private defaultOptions: FindOptions<InvestmentQuestionnaire> = {
    populate: {
      options: true,
    },
    orderBy: {
      order: QueryOrder.ASC,
      options: {
        order: QueryOrder.ASC,
      },
    },
  };

  public async findAllOrSpecificQuestionnaire(
    args: GetAllQuestionnaireArgs
  ): Promise<InvestmentQuestionnaire[]> {
    const where = args.id ? { id: args.id } : {};
    const items = await this.find(where, this.defaultOptions);

    if (args.id && items.length === 0) {
      throw new QuestionnaireNotFound();
    }

    return items;
  }

  public async findByCategoryAndOrder(
    category: InvestmentQuestionnaireCategory,
    order: number
  ): Promise<InvestmentQuestionnaire> {
    const where = { category, order };
    const foundQuestionnaire = await this.findOne(
      where,
      this.defaultOptions.populate,
      this.defaultOptions.orderBy
    );
    if (!foundQuestionnaire) {
      throw new QuestionnaireNotFound();
    }
    return foundQuestionnaire;
  }
}
