import Telegraf from 'telegraf';
import _ from 'lodash';
import Bot from './Bot';
import logger from '../../helper/logger';
import PigService from './../pigBL';
import config from '../../config/env/index';
import UserDao from '../../dataAccess/UserDao';
import { models } from '../../models';
import path from "path";

const { chatData: ChatDataModel } = models;

export default class TelegramBot extends Bot {
  constructor() {
    super();
    this.pigService = new PigService();
    this.bot = new Telegraf(config.telegramVerifyToken);
    this.bot.telegram.setWebhook(`${config.appUrl}${config.telegramPath}`);
  }

  init() {
    this.bot.use((ctx, next) => {
      const userDao = new UserDao(models);
      const telegramId = ctx.message.from.id.toString();
      const userName = ctx.message.from.first_name;

      return userDao.getUserByTelegramId(telegramId)
        .then((user) => {
          if (!_.isEmpty(user)) {
            return user;
          }
          return userDao.addUser({ telegramId, name: userName });
        })
        .then((user) => {
          ctx.user = user.get();
          return next();
        });
    });

    this.bot.on('message', (ctx) => {
      logger.info(ctx.message);
      const { message: { text } } = ctx;

      return ChatDataModel.build({ text, voiceId: ctx.user.selectedVoiceId || config.defaultVoiceId, userId: ctx.user.id })
        .validate()
        .then(chatData => this.pigService.pigSpeak(chatData.get()))
        .then(audioData => ctx.replyWithAudio({ source: path.normalize(`${__dirname}/../../..${audioData.pathToFile}`) }));
    });
  }

  start() {
    this.init();
    this.bot.startWebhook(config.telegramPath, null, config.port);
  }
}
