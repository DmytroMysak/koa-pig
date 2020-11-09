const PlayerService = require('../playerService');
const logger = require('../../helper/logger');
const config = require('../../config/index');

module.exports = class BaseCommand {
  constructor(channel) {
    this.player = new PlayerService();
    this.name = null;
    this.channel = channel;

    this.chatId = null; // set in CommandProcessorService
    this.msg = null; // set in CommandProcessorService
  }

  ack() {
    this.channel.ack(this.msg);
  }

  sendResponse(data) {
    const response = { ...data, chatId: this.chatId };
    logger.debug(`Sending to server: ${JSON.stringify(response, null, 2)}`);
    this.channel.sendToQueue(config.amqp.responseQueueName, Buffer.from(JSON.stringify(response)));
    this.ack(this.msg);
  }

  sendReject() {
    return this.channel.nack(this.msg, false, false);
  }
};
