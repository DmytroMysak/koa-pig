import pino from 'pino';
import config from '../config/env';

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const pinoConfig = {
  prettyPrint: config.env === 'production' ? undefined : { translateTime: 'SYS:standard' },
  level: config.loggerLevel,
};
const logger = pino(pinoConfig);

if (config.env !== 'development') {
  pino.destination(`${config.folderToSaveLogs}/results.log`);
}

export const telegramErrorLogging = (error, ctx) => {
  if (error.name === 'ValidationError') {
    logger.info(error.message);
    return ctx.reply(error.message);
  }
  logger.error(error);
};

export default logger;
