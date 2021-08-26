import { Options } from '@mikro-orm/core';

const config = {
  forceUtcTimezone: true,
  forceUndefined: true,
  type: 'postgresql',
  autoLoadEntities: true,
  debug: process.env.NODE_ENV !== 'production',
} as Options;

export default config;
