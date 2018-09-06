import winston from 'winston';
import fs from 'fs';
import config from '../config/env';

// Create the log directory if it does not exist
if (!fs.existsSync(config.folderToSaveLogs)) {
  fs.mkdirSync(config.folderToSaveLogs);
}

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
      winston.format.timestamp(),
      winston.format.prettyPrint(),
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
