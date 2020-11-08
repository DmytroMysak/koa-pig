const logger = require('./helper/logger');
const CommandProcessorService = require('./services/commandProcessorService');
const queueService = require('./services/amqpService');

const main = async () => {
  const commandProcessor = new CommandProcessorService();
  await Promise.all([
    commandProcessor.initialize(),
    queueService.initialize(),
  ]);

  await queueService.processMessages((data) => commandProcessor.selectCommandAndExecute(data));
  logger.info('Client started');
};

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
