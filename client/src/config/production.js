const path = require('path');

module.exports = {
  env: 'production',
  logger: {
    level: 'debug',
    logsDirectory: path.normalize(`${__dirname}/../../logs`),
  },
};
