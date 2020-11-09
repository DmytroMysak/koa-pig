const amqplib = require('amqplib');
const config = require('./config/index');
const logger = require('./helper/logger');
const CommandProcessorService = require('./services/commandProcessorService');

const main = async () => {
  const connection = await amqplib.connect(config.amqp.url);
  const channel = await connection.createChannel();
  logger.debug('Connected to RabbitMQ');

  const commandProcessor = new CommandProcessorService(channel);
  await commandProcessor.initialize();

  await channel.consume(config.amqp.queueName, (msg) => {
    if (!msg) {
      return channel.nack(msg, false, false);
    }

    return commandProcessor.selectCommandAndExecute(msg)
      .catch((error) => {
        logger.error('Unexpected error!');
        logger.error(error);
        return channel.nack(msg, false, false);
      });
  });
  logger.info('Client started');
};

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
