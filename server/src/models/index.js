const mongoose = require('mongoose');
const logger = require('../helper/logger');
const config = require('../config/env');

// eslint-disable-next-line import/prefer-default-export
const dbInitialize = async () => {
  const { uri, options } = config.mongoose;
  await mongoose.connect(uri, options);
  logger.info('Connected to Mongo DB');
  mongoose.connection.on('error', logger.error);
  mongoose.connection.on('disconnected', () => logger.warn('Disconnected = require(Mongo DB'));
  mongoose.connection.on('reconnected', () => logger.warn('Reconnected to Mongo DB'));
};

module.exports = {
  dbInitialize,
};
