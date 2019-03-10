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


export default logger;
