const Telegraf = require('telegraf');
const logger = require('../../helper/logger');
const config = require('../../config/env/index');
const User = require('../../models/users');
const CommandProcessorService = require('../commandProcessorService');

module.exports = class TelegramBot {
  constructor(appUrl, port) {
    this.port = port;
    this.appUrl = appUrl;
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot', telegram: { webhookReply: false } });

    this.commandProcessor = new CommandProcessorService();
  }

  sendResponseAndTranslate(input, ctx) {
    let text;
    if (Array.isArray(input)) {
      text = input.map((elem) => {
        if (elem.translate) {
          return this.i18n.translate(elem.text, ctx.user.locale);
        }
        return elem.text;
      });
    } else {
      text = this.i18n.translate(input, ctx.user.locale);
    }
    return ctx.reply(text);
  }

  async userMiddleware(ctx, next) {
    logger.debug(ctx.message);

    if (!ctx.from) {
      next();
    }
    const { username, first_name: firstName, last_name: lastName, id: telegramId } = ctx.from;
    try {
      ctx.user = (await User.findOneAndUpdate(
        { telegramId: telegramId.toString() },
        { telegramId: telegramId.toString(), username, firstName, lastName },
        { upsert: true, setDefaultsOnInsert: true, new: true },
      )).toJSON();
    } catch (error) {
      this.telegramErrorLogging(error, ctx);
      next(error);
    }
    next();
  }

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

  workWithDocument(ctx) {
    if (ctx.message.document.mime_type !== 'audio/mp3') {
      return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
    }
    return this.workWithAudio(ctx, ctx.message.document)
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }

  async start() {
    await this.commandProcessor.initializeCommands();

    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));

    this.commandProcessor.getCommands().forEach((command) => {
      if (command.name) {
        this.bot[command.type](command.name, ((ctx) => command.execute(ctx)));
      } else {
        this.bot[command.type](((ctx) => command.execute(ctx)));
      }
    });

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
};
