import winston from 'winston';
import fs from 'fs';
import moment from 'moment';
import config from '../config/env';

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tsFormat = () => moment().format('DD/MM/YYYY HH:mm:ss');

export const options = {
  file: {
    level: config.env === 'development' ? 'debug' : 'info',
    filename: `${logDir}/results.log`,
    handleExceptions: true,
    json: true,
    timestamp: tsFormat,
  },
  console: {
    level: 'debug',
    timestamp: tsFormat,
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.file),
  ],
});

export default logger;
