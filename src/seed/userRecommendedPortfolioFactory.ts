import { Injectable, Logger } from '@nestjs/common';
import { UserRecommendedPortfolioService } from '../portfolio/userRecommendedPortfolio.service';
import { SeedConfig } from './seed.config';

@Injectable()
export class UserRecommendedPortfolioFactory {
  protected readonly logger: Logger;

  public constructor(
    private readonly userRecommendedPortfolioService: UserRecommendedPortfolioService,
    private readonly seedConfig: SeedConfig
  ) {
    this.logger = new Logger(UserRecommendedPortfolioFactory.name);
  }

  public async create() {
    let assets: Array<{
      id: string;
      asset: string;
      weight: number;
      userId: string;
    }> = [];
    const userId: string = this.seedConfig.getUserId();
    if (this.seedConfig.isDev) {
      assets = [
        {
          id: 'c1570247-1ff3-4329-986b-0ad630755e99',
          asset: 'BIL',
          weight: 0.027797647773912918,
          userId,
        },
        {
          id: 'f089d9f9-c575-4c40-b0e1-dd08bf8ec304',
          asset: 'VTI',
          weight: 0.08142718926873418,
          userId,
        },
        {
          id: '9aecd8e2-9ba2-4f38-8e8c-434d17e0e04b',
          asset: 'VEA',
          weight: 0.08173657072930336,
          userId,
        },
        {
          id: '70ea6e97-c5df-492a-a3ee-f053d443930f',
          asset: 'VWO',
          weight: 0.0763578824389885,
          userId,
        },
        {
          id: 'f983f6ad-17c0-4a1f-8349-87769437a93a',
          asset: 'VGSH',
          weight: 0.015830277142395936,
          userId,
        },
        {
          id: '66f5651f-37f3-4ccb-acfe-60bc9b317c69',
          asset: 'VGIT',
          weight: 0.014800745624637153,
          userId,
        },
        {
          id: '5d021bd4-acf6-49b7-90f5-df8a47c71c32',
          asset: 'VGLT',
          weight: 0.014112342725792974,
          userId,
        },
        {
          id: '9138e15a-a059-4a38-bd8d-5cb9e54c8ede',
          asset: 'LQD',
          weight: 0.017389569422037822,
          userId,
        },
        {
          id: '0ca93091-97b4-4d1c-90da-5e1cdc8a535a',
          asset: 'HYG',
          weight: 0.023465631220655234,
          userId,
        },
        {
          id: '62948b82-489e-41c6-ada1-e757abe700c7',
          asset: 'VWOB',
          weight: 0.017981480337118102,
          userId,
        },
        {
          id: '95d4e3cd-99a8-42b5-aa60-00ed197d656a',
          asset: 'TIP',
          weight: 0.052252663683395734,
          userId,
        },
        {
          id: 'd8856af2-1d4e-4863-bfa3-69a1578d588f',
          asset: 'GLD',
          weight: 0.05357261927507374,
          userId,
        },
        {
          id: '23fe7b90-0c9d-477d-929d-f5aa12338be8',
          asset: 'PDBC',
          weight: 0.07001188456913959,
          userId,
        },
        {
          id: 'b58a0bbe-5a71-4487-b36e-9c8f21b712fb',
          asset: 'VNQ',
          weight: 0.06737594576115156,
          userId,
        },
        {
          id: '99a55153-868b-4c5c-82d8-e76b10f5174d',
          asset: 'QVAL',
          weight: 0.0304055124745054,
          userId,
        },
        {
          id: 'fbaedbc5-7efb-4244-b884-a928a2e5d130',
          asset: 'QMOM',
          weight: 0.013293357391654492,
          userId,
        },
        {
          id: 'b86e5415-c914-445e-8d46-b3cfd309f69d',
          asset: 'VIG',
          weight: 0.03280458666816704,
          userId,
        },
        {
          id: '711b7b09-9a02-4e5d-aeb5-52d763f3eaad',
          asset: 'BLOK',
          weight: 0.0392870241594786,
          userId,
        },
        {
          id: '505f8009-ff19-4d6f-ab78-98a8dad5d9c7',
          asset: 'QQQJ',
          weight: 0.05311196708865674,
          userId,
        },
        {
          id: '1f88b2f0-06d6-4fe2-a82b-ef47d76f5e71',
          asset: 'ARKK',
          weight: 0.0761967714425014,
          userId,
        },
        {
          id: '063463b2-0b9e-4299-89c8-2b84e1d4ab51',
          asset: 'IBB',
          weight: 0.044344042510025106,
          userId,
        },
        {
          id: '5f951859-ab1b-49f8-ad72-dcb940d05a7d',
          asset: 'NACP',
          weight: 0.031781233807051903,
          userId,
        },
        {
          id: 'e482b05b-3032-4679-aea0-384fcde6fc29',
          asset: 'SHE',
          weight: 0.012210328399949896,
          userId,
        },
        {
          id: '736ed541-4e6e-4927-bbe5-7b692cc3c23d',
          asset: 'ICLN',
          weight: 0.0290665592392402,
          userId,
        },
        {
          id: '7790a53d-c5d1-4bd1-b369-6d1801508450',
          asset: 'MAGA',
          weight: 0.02338616684643243,
          userId,
        },
      ];
    }

    if (userId) {
      await this.userRecommendedPortfolioService.nativeDelete({ userId });
    }
    await Promise.all(
      assets.map((asset) => {
        const recommendedPortfolio =
          this.userRecommendedPortfolioService.create(asset);

        return this.userRecommendedPortfolioService.upsert({
          data: recommendedPortfolio,
          where: { id: recommendedPortfolio.id },
        });
      })
    );
  }
}
