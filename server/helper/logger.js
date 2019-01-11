import pino from 'pino';
import config from '../config/env';

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino(config.env === 'development' ? { prettyPrint: { translateTime: 'SYS:standard' } } : undefined);

if (config.env !== 'development') {
  pino.destination(`${config.folderToSaveLogs}/results.log`);
}


export default logger;
