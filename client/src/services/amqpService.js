const amqplib = require('amqplib');
const logger = require('../helper/logger');
const config = require('../config/index');

let channel;

module.exports = {
  initialize: async () => {
    const connection = await amqplib.connect(config.amqp.url);
    channel = await connection.createChannel();
    logger.debug('Connected to RabbitMQ');
  },
  processMessages: async (processor) => {
    await channel.consume(config.amqp.queueName, (msg) => {
      if (!msg) {
        return channel.nack();
      }
      const message = JSON.parse(msg.content.toString());
      logger.debug('Message from server:');
      logger.debug(message);

      return processor(message)
        .then((response) => {
          logger.debug('Sending to server:');
          logger.debug(response);
          channel.ack();
          channel.sendToQueue(config.amqp.responseQueueName, Buffer.from(response));
        })
        .catch((error) => {
          logger.error('Unexpected error');
          logger.error(error);
          channel.nack();
        });
    });
  },
};
