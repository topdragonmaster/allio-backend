import { Injectable } from '@nestjs/common';
import { InvestmentQuestionnaire } from './investmentQuestionnaire.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { GetAllQuestionnaireArgs } from './dto/getAllQuestionnaire.args';
import { NotFoundError } from '../shared/errors';

@Injectable()
export class InvestmentQuestionnaireService {
  public constructor(
    @InjectRepository(InvestmentQuestionnaire)
    private readonly investmentQuestionnaireRepo: EntityRepository<InvestmentQuestionnaire>
  ) {}

  public async findAll(
    args: GetAllQuestionnaireArgs
  ): Promise<InvestmentQuestionnaire[]> {
    const where = args.id ? { id: args.id } : {};
    const items = await this.investmentQuestionnaireRepo.find(where, {
      populate: {
        options: true,
      },
      orderBy: {
        order: QueryOrder.ASC,
        options: {
          createdAt: QueryOrder.ASC,
        },
      },
    });

    if (args.id && items.length === 0) {
      throw new NotFoundError('Questionnaire not found');
    }

    return items;
  }
}
