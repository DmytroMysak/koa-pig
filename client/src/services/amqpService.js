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
        return channel.nack(msg);
      }
      const message = JSON.parse(msg.content.toString());
      logger.debug(`Message from server: ${JSON.stringify(message, null, 2)}`);

      return processor(message)
        .then((response) => {
          if (response) {
            logger.debug(`Sending to server: ${JSON.stringify(message, null, 2)}`);
            channel.sendToQueue(config.amqp.responseQueueName, Buffer.from(JSON.stringify(response)));
          }
          channel.ack(msg);
        })
        .catch((error) => {
          logger.error('Unexpected error!');
          logger.error(error);
          channel.nack(msg);
        });
    });
  },
};
