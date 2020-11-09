const amqplib = require('amqplib');
const logger = require('../helper/logger');
const config = require('../config');

let channel;
let telegramInstance;

module.exports = {
  initialize: async () => {
    const connection = await amqplib.connect(config.amqp.url);
    channel = await connection.createChannel();
    logger.debug('Connected to RabbitMQ');

    await channel.assertQueue(config.amqp.responseQueueName, { durable: true });
    await channel.consume(config.amqp.responseQueueName, (msg) => {
      if (!msg) {
        return channel.nack(msg, false, false);
      }
      let response;
      try {
        response = JSON.parse(msg.content.toString());
      } catch (error) {
        logger.error(`Bad response: ${msg.content.toString()}`);
        return channel.nack(msg, false, false);
      }
      logger.debug(response);
      if (!telegramInstance) {
        logger.error('No telegram instance to send response');
        return channel.nack(msg);
      }
      telegramInstance.sendMessage(response.chatId, response.message);
      return channel.ack(msg);
    });
  },
  setTelegramInstance: (telegram) => {
    telegramInstance = telegram;
  },
  sendToClients: async (object, clients) => {
    logger.debug(`Sending to clients: [${clients.map((cl) => cl.name).join(', ')}]`);
    logger.debug(object);

    await Promise.all(clients.map((client) => channel.assertQueue(client.accessKey)));
    await Promise.all(clients.map((client) => channel.sendToQueue(client.accessKey, Buffer.from(JSON.stringify(object)))));
  },
};
