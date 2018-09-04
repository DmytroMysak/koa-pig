import config from '../config/env';
import logger from '../helper/logger';
import telegramBot from '../businessLogic/telegramBL';


telegramBot.on('message', (ctx) => {
  debugger;
  // send url via Telegram server
  ctx.replyWithPhoto('https://picsum.photos/200/300/');
});

telegramBot.on('text', (ctx) => {
  debugger;
  // send url via Telegram server
  ctx.replyWithPhoto('https://picsum.photos/200/300/');
});

// export default telegramBot.webhookCallback(`/webhook${config.telegramVerifyToken}`);
