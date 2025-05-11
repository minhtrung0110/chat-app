// src/common/logger/winston.config.ts
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(), // <== màu ở đây
        nestWinstonModuleUtilities.format.nestLike('ChatApp', { prettyPrint: true }),
      ),
    }),
  ],
};
