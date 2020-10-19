const amqplib = require('amqplib');
const logger = require('../helper/logger');
const config = require('../config/env/index');

let channel;

module.exports = {
  initialize: async () => {
    const connection = await amqplib.connect(config.amqpUrl);
    channel = await connection.createChannel();
    logger.debug('Connected to RabbitMQ');
  },
  sendToClients: async (object, clients) => {
    logger.debug(`Sending to clients: [${clients.map((cl) => cl.name).join(', ')}]`);
    logger.debug(object);

    await Promise.all(clients.map((client) => channel.assertQueue(client.accessKey)));
    await Promise.all(clients.map((client) => channel.sendToQueue(client.accessKey, Buffer.from(object))));
  },
};
