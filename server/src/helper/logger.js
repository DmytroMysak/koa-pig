import pino from 'pino';
import config from '../../config/env';

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino(config.loggerLevel);

export default logger;
