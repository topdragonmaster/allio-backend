import { Options } from '@mikro-orm/core';
import { IS_PROD } from './shared/constants';

const config = {
  forceUtcTimezone: true,
  forceUndefined: true,
  type: 'postgresql',
  autoLoadEntities: true,
  debug: !IS_PROD,
} as Options;

export default config;
