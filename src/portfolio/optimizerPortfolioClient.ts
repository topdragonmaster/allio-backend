import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, throwError } from 'rxjs';
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
  assets: string[] | null;
  weights: string[] | null;
  errors: Record<string, string> | null;
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
    const { data }: AxiosResponse<OptimizerResponse> = await firstValueFrom(
      this.httpService.post<OptimizerResponse>(this.optimizerUrl, props).pipe(
        catchError((err) =>
          throwError(
            () =>
              new BadRequestError('Optimize portfolio error', {
                details: err.response?.data,
              })
          )
        )
      )
    );

    if (data.errors && Object.keys(data.errors).length) {
      throw new BadRequestError('Optimize portfolio error', {
        details: data.errors,
      });
    }

    return data;
  }
}
