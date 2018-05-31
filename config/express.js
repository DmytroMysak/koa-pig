import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import winston from 'winston';
import expressWinston from 'express-winston';
import routes from '../route';
import { options } from '../helper/logger';

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true,
  parameterLimit: 50000,
}));
app.use(compression());
app.use(helmet());
app.use(cors());

app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({ ...options.console, json: true }),
    new (winston.transports.File)(options.file),
  ],
  meta: true,
  expressFormat: true,
  colorize: true,
}));

app.use('/', routes);

export default app;

