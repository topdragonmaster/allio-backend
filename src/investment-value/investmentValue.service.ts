import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { InvestmentValue } from './entities/investmentValue.entity';

@Injectable()
export class InvestmentValueService extends BaseService<InvestmentValue> {
  constructor(
    @InjectRepository(InvestmentValue)
    private readonly investmentValueRepository: EntityRepository<InvestmentValue>
  ) {
    super(investmentValueRepository);
  }
}
