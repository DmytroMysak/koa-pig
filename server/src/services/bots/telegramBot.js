import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import logger from '../../helper/logger';
import validator from '../../helper/validator';
import userService from '../userService';
import config from '../../../config/env/index';
import CommandProcessor from '../commandProcessor';

export default class TelegramBot {
  /**
   * Represents a telegram bot.
   * @constructor
   * @param {string} appUrl
   * @param {number} port
   */
  constructor(appUrl, port) {
    this.port = port;
    this.appUrl = appUrl;
    this.languageChangePrefix = 'lc_';
    this.voiceChangePrefix = 'vc_';
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot', telegram: { webhookReply: false } });

    this.commandProcessor = new CommandProcessor();
  }

  /**
   * Middleware to save user in db & add to context (ctx) for every request
   * @param {object} ctx
   * @param next
   */
  async userMiddleware(ctx, next) {
    logger.debug(ctx.message);
    if (!ctx.from) {
      next();
    }
    const { username, first_name: firstName, last_name: lastName, id: telegramId } = ctx.from;
    try {
      ctx.user = await userService.upsertUserByTelegramId({
        telegramId: telegramId.toString(), username, firstName, lastName,
      });
    } catch (error) {
      this.telegramErrorLogging(error, ctx);
      next(error);
    }
    next();
  }

  /**
   * Template for creating inline keyboard
   * @return {Promise}
   * @param {Error} error
   * @param {object} ctx
   */
  telegramErrorLogging(error, ctx) {
    if (error.name !== 'ValidationError') {
      return logger.error(error);
    }
    if (Array.isArray(error.message)) {
      logger.info(error.message.map((elem) => elem.text).join(' '));
    } else {
      logger.info(error.message);
    }
    return this.sendResponseAndTranslate(error.message, ctx);
  }

  /**
   * @param {object} ctx
   * @param {object|null} data
   * @return {Promise}
   */
  workWithAudio(ctx, data = null) {
    const params = {
      fileId: data ? data.file_id : ctx.message.audio.file_id,
      getFileUrl: () => ctx.telegram.getFileLink(data || ctx.message.audio),
      volume: ctx.user.volume,
      clients: ctx.user.clients,
    };
    return this.serverService.processAudio(params)
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  workWithVoice(ctx) {
    const params = {
      fileId: ctx.message.voice.file_id,
      getFileUrl: () => ctx.telegram.getFileLink(ctx.message.audio),
      volume: ctx.user.volume,
      clients: ctx.user.clients,
    };
    return this.serverService.processAudio(params)
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  workWithText(ctx) {
    const { message: { text } } = ctx;
    if (validator.isUrl(text) && !text.includes('youtube')) {
      return this.sendResponseAndTranslate('sorry_only_youtube', ctx);
    }

    if (validator.isUrl(text)) {
      return this.serverService.processUrl({ url: text, userId: ctx.user.id }, ctx.user.volume, ctx.user.clients)
        .catch((error) => this.telegramErrorLogging(error, ctx));
    }
    const params = {
      text,
      voiceId: ctx.user.voiceId || config.defaultVoiceId,
      userId: ctx.user.id,
    };
    return this.serverService.processText(params, ctx.user.volume, ctx.user.clients)
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  workWithDocument(ctx) {
    if (ctx.message.document.mime_type !== 'audio/mp3') {
      return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
    }
    return this.workWithAudio(ctx, ctx.message.document)
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  /**
   * Work with inline button response
   * @param {object} ctx
   * @return {Promise}
   */
  workWithCallbackQuery(ctx) {
    if (ctx.callbackQuery.data === '/s') {
      return this.sendSelectedVoice(ctx);
    }
    if (ctx.callbackQuery.data === '/l') {
      return this.sendLanguageList(ctx);
    }
    if (ctx.callbackQuery.data === '/c') {
      return this.sendChangeVoiceInstructions(ctx);
    }
    if (ctx.callbackQuery.data === '/v') {
      return this.sendVoiceList(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.languageChangePrefix)) {
      const languageId = ctx.callbackQuery.data.replace(this.languageChangePrefix, '');
      return this.sendVoiceList(ctx, languageId);
    }
    if (ctx.callbackQuery.data.startsWith(this.voiceChangePrefix)) {
      const voiceId = ctx.callbackQuery.data.replace(this.voiceChangePrefix, '');
      return this.changeUserVoice(ctx, voiceId);
    }
    return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
  }

  /**
   * @param {object} ctx
   * @param {string|null} languageId
   * @return {Promise}
   */
  async sendVoiceList(ctx, languageId = null) {
    try {
      const voiceList = await this.voiceService.getVoicesList(languageId);
      const buttonNameFunction = (elem) => `${elem.name}(${elem.gender}${languageId ? '' : `, ${elem.languageCode}`})`;
      const buttonIdFunction = (elem) => `${this.voiceChangePrefix}${elem.id}`;
      const list = await TelegramBot.createInlineKeyboard(voiceList.rows, languageId ? 3 : 2, buttonNameFunction, buttonIdFunction);
      await this.sendResponseAndTranslate('voice_list:', ctx);
      return ctx.reply(list);
    } catch (error) {
      return this.telegramErrorLogging(error, ctx);
    }
  }

  /**
   * @param {object} ctx
   * @param {string} voiceId
   * @return {Promise}
   */
  changeUserVoice(ctx, voiceId) {
    return this.userService.updateUserVoiceId(ctx.user.id, voiceId)
      .then(() => this.sendResponseAndTranslate('voice_changed', ctx))
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @return {Promise}
   */
  async start() {
    await this.commandProcessor.initializeCommands();
    await this.i18n.initialize();

    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));

    const commands = this.commandProcessor.getCommands();
    commands.forEach((command) => {
      if (command.name) {
        this.bot[command.type](command.name, ((ctx) => command.exec(ctx)));
      } else {
        this.bot[command.type](((ctx) => command.exec(ctx)));
      }
    });

    this.bot.on('callback_query', (ctx) => this.workWithCallbackQuery(ctx));
    this.bot.on('text', (ctx) => this.workWithText(ctx));
    this.bot.on('audio', (ctx) => this.workWithAudio(ctx));
    this.bot.on('voice', (ctx) => this.workWithVoice(ctx));
    this.bot.on('document', (ctx) => this.workWithDocument(ctx));
    this.bot.on('message', (ctx) => this.sendResponseAndTranslate('no_idea_what_to_do', ctx));
    this.bot.catch((error) => {
      if (!error) {
        return;
      }
      if (error.name === 'ValidationError') {
        logger.info(error.message);
      }
      logger.error(error);
    });
    return this.bot.launch({
      webhook: {
        domain: `${this.appUrl}${config.telegramPath}`,
        port: this.port,
      },
    });
  }
}
