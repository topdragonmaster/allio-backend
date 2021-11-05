import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { BadRequestError } from '../shared/errors';

export type PortfolioWorkflow = 'full' | 'partial' | 'self';

export interface PortfolioOptimizerProps {
  workflow: PortfolioWorkflow;
  risk_tolerance: number;
  assets?: string[];
  groups?: string[];
  investment_values?: string[];
  run_radar?: boolean;
}

export interface OptimizerResponse {
  portfolio: {
    assets: string[] | null;
    weights: string[] | null;
  };
  error: [] | null;
}

@Injectable()
export class OptimizerPortfolioClient {
  private readonly logger: Logger;
  private readonly optimizerUrl: string;
  public constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const baseUrl = this.configService.get('OPTIMIZER_PORTFOLIO_BASE_URL');
    this.optimizerUrl = `${baseUrl}/optimizer`;
    this.logger = new Logger(OptimizerPortfolioClient.name);
  }

  public async optimizePortfolio(
    props: PortfolioOptimizerProps
  ): Promise<OptimizerResponse> {
    try {
      const result: AxiosResponse<OptimizerResponse> = await firstValueFrom(
        this.httpService.post<OptimizerResponse>(this.optimizerUrl, props)
      );
      return result.data;
    } catch (e) {
      this.logger.error(e.response.data);
      throw new BadRequestError('Optimize portfolio error', {
        details: e.response.data,
      });
    }
  }
}
