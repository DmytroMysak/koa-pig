import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import _ from 'lodash';
import path from 'path';
import Bot from './Bot';
import logger from '../../helper/logger';
import validator from '../../helper/validator';
import PigService from '../pigBL';
import Audio from '../audioBL';
import config from '../../config/env/index';
import UserDao from '../../dataAccess/UserDao';
import { models } from '../../models';

const { chatData: ChatDataModel } = models;

export default class TelegramBot extends Bot {
  constructor(appUrl) {
    super();
    this.pigService = new PigService();
    this.audio = new Audio();
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot' });
    this.bot.telegram.setWebhook(`${appUrl}${config.telegramPath}`);
  }

  init() {
    this.bot.use((ctx, next) => this.initMiddleware(ctx, next));
    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));
    this.bot.start(ctx => ctx.reply('Welcome! Write me some text. For more info use /help'));
    this.bot.help(ctx => ctx.reply('/menu or /m -> menu \n/selected or /s -> current voice \n/change or /c -> change voice \n/language or /l -> language list \n/voice or /v -> voice list'));

    this.bot.command('menu', ctx => this.menu(ctx));
    this.bot.command('m', ctx => this.menu(ctx));
    // TODO
    this.bot.command('selected', ctx => ctx.reply('not implemented yet'));
    this.bot.command('s', ctx => ctx.reply('not implemented yet'));
    this.bot.command('change', ctx => ctx.reply('not implemented yet'));
    this.bot.command('c', ctx => ctx.reply('not implemented yet'));
    this.bot.command('language', ctx => ctx.reply('not implemented yet'));
    this.bot.command('l', ctx => ctx.reply('not implemented yet'));
    this.bot.command('voice', ctx => ctx.reply('not implemented yet'));
    this.bot.command('v', ctx => ctx.reply('not implemented yet'));

    this.bot.on('text', ctx => this.workWithText(ctx));
    this.bot.on('audio', ctx => this.workWithAudio(ctx));
    this.bot.on('document', (ctx) => {
      if (ctx.message.document.mime_type !== 'audio/mp3') {
        return ctx.reply('І що мені блять з цим робити?');
      }
      return this.workWithAudio(ctx);
    });

    this.bot.catch((err) => {
      if (err) {
        logger.error(err);
        // тому що вінстон 3.0 гамно їбане блять
        console.log(err); // eslint-disable-line no-console
      }
    });
  }

  workWithAudio(ctx) {
    const fileId = ctx.message.audio.file_id;
    return this.pigService.pigSpeakAudio(fileId, () => ctx.telegram.getFileLink(ctx.message.audio))
      .then(() => ctx.reply('Done'));
  }

  workWithText(ctx) {
    const { message: { text } } = ctx;
    if (validator.isUrl(text) && !text.includes('youtube')) {
      return ctx.reply('І що мені блять з цим робити?');
    }
    if (validator.isUrl(text)) {
      return this.pigService.pigSpeakFromUrl(text);
    }

    return ChatDataModel.build({ text, voiceId: ctx.user.selectedVoiceId || config.defaultVoiceId, userId: ctx.user.id })
      .validate()
      .then(chatData => this.pigService.pigSpeakText(chatData.get()))
      .then(audioData => ctx.replyWithAudio({ source: path.normalize(`${__dirname}/../../..${audioData.pathToFile}`) }));
  }

  userMiddleware(ctx, next) {
    if (!ctx.message) {
      return next();
    }
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

  initMiddleware(ctx, next) {
    ctx.reply('Processing...');
    if (!ctx.message) {
      return next();
    }
    logger.info(ctx.message);
    return next();
  }

  // TODO
  menu({ reply }) {
    // return reply('MENU', Markup
    //   .inlineKeyboard([
    //     Markup.callbackButton('Selected voice', '/s'),
    //     Markup.callbackButton('Language list', '/l'),
    //     Markup.callbackButton('Voice list', '/v'),
    //   ])
    // );
    return reply('MENU', Extra.HTML().markup(m => m.inlineKeyboard([
      Markup.callbackButton('Selected voice', '/s'),
      Markup.callbackButton('Language list', '/l'),
      Markup.callbackButton('Voice list', '/v'),
    ])),
    );
  }

  start() {
    this.init();
    this.bot.startWebhook(config.telegramPath, null, config.port);
  }
}
