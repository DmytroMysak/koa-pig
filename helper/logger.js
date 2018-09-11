import winston from 'winston';
import config from '../config/env';

export const options = {
  file: {
    level: config.env === 'development' ? 'debug' : 'info',
    filename: `${config.folderToSaveLogs}/results.log`,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  },
  console: {
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(function(info) {
        return `${new Date().toISOString()}-${info.level}: \n${typeof info.message === 'object' ? JSON.stringify(info.message, null, 4) : info.message}\n`;
      }),
    ),
  },
};

const logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.file),
  ],
});

export default logger;
