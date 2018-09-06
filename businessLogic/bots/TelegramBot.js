import Telegraf from 'telegraf';
import _ from 'lodash';
import path from 'path';
import Bot from './Bot';
import logger from '../../helper/logger';
import PigService from '../pigBL';
import Audio from '../audioBL';
import config from '../../config/env/index';
import UserDao from '../../dataAccess/UserDao';
import { models } from '../../models';

const { chatData: ChatDataModel } = models;

export default class TelegramBot extends Bot {
  constructor() {
    super();
    this.pigService = new PigService();
    this.audio = new Audio();
    this.bot = new Telegraf(config.telegramVerifyToken);
    this.bot.telegram.setWebhook(`${config.appUrl}${config.telegramPath}`);
  }

  init() {
    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));

    this.bot.on('text', (ctx) => {
      const { message: { text } } = ctx;
      ctx.reply('Processing...');

      return ChatDataModel.build({ text, voiceId: ctx.user.selectedVoiceId || config.defaultVoiceId, userId: ctx.user.id })
        .validate()
        .then(chatData => this.pigService.pigSpeakText(chatData.get()))
        .then(audioData => ctx.replyWithAudio({ source: path.normalize(`${__dirname}/../../..${audioData.pathToFile}`) }));
    });

    this.bot.on('document', (ctx) => {
      if (ctx.message.document.mime_type !== 'audio/mp3') {
        return ctx.reply('Що мені блять з цим робити?');
      }
      return this.workWithAudio(ctx);
    });

    this.bot.on('audio', ctx => this.workWithAudio(ctx));

    this.bot.catch((err) => {
      if (err) {
        logger.error(err);
      }
    });
  }

  workWithAudio(ctx) {
    const fileId = ctx.message.audio.file_id;
    ctx.reply('Processing...');

    return this.pigService.pigSpeakAudio(fileId, () => ctx.telegram.getFileLink(ctx.message.audio))
      .then(() => ctx.reply('Done'));
  }

  userMiddleware(ctx, next) {
    logger.info(ctx.message);
    const userDao = new UserDao(models);
    const telegramId = ctx.message.from.id.toString();
    const { user_name: userName, first_name: firstName, last_name: lastName } = ctx.message.from;

    return userDao.getUserByTelegramId(telegramId)
      .then((user) => {
        if (!_.isEmpty(user)) {
          return user;
        }
        return userDao.addUser({
          telegramId, userName, firstName, lastName,
        });
      })
      .then((user) => {
        ctx.user = user.get();
        return next();
      })
      .catch(err => logger.error(err));
  }

  start() {
    this.init();
    this.bot.startWebhook(config.telegramPath, null, config.port);
  }
}
