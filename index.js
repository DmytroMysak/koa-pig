import app from './config/express';
import config from './config/env';
import logger from './helper/logger';

app.listen(config.port, () => logger.info(`App listening on port ${config.port}!`));
