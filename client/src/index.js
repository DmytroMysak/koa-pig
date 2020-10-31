const fs = require('fs');
const config = require('./config');
const logger = require('./helper/logger');
const commandProcessor = require('./services/commandProcessorService');

// Create the songs directory if it doesn't exist
if (!fs.existsSync(config.songsDirectory)) {
  fs.mkdirSync(config.songsDirectory);
}
// Create the log directory if it does not exist
if (!fs.existsSync(config.logsDirectory)) {
  fs.mkdirSync(config.logsDirectory);
}

// todo

logger.info('Client started');
