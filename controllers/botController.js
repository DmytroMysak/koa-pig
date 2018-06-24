import express from 'express';
import config from '../config/env';
import logger from '../helper/logger';
import BotService from '../businessLogic/botBL';

const router = express.Router(); // eslint-disable-line new-cap
const botService = new BotService();

router.get('/webhook', (req, res) => {
  const { mode, challenge, verify_token: token } = req.query.hub;

  if (mode && token && mode === 'subscribe' && token === config.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post('/webhook', (req, res) => {
  if (req.body.object !== 'page') {
    return res.sendStatus(404);
  }

  req.body.entry.forEach((entry) => {
    const webHookEvent = entry.messaging[0];
    logger.info(webHookEvent);

    if (webHookEvent.message) {
      botService.handleMessage(webHookEvent.message, req.user);
    } else if (webHookEvent.postback) {
      botService.handlePostBack(webHookEvent.postback, req.user);
    }
  });
  return res.status(200).send('EVENT_RECEIVED');
});

export default router;
