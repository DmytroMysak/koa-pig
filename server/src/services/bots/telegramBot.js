const Telegraf = require('telegraf');
const logger = require('../../helper/logger');
const config = require('../../config');
const User = require('../../models/users');
const i18nService = require('../i18nService');
const CommandProcessorService = require('../commandProcessorService');
const clientService = require('../clientService');

module.exports = class TelegramBot {
  constructor(appUrl, port) {
    this.port = port;
    this.appUrl = appUrl;
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot', telegram: { webhookReply: false } });
    this.i18n = i18nService;

    this.commandProcessor = new CommandProcessorService();
  }

  async userMiddleware(ctx, next) {
    logger.debug(`Incoming data: ${JSON.stringify(ctx.message || ctx.update, null, 2)}`);
    clientService.setTelegramInstance(ctx.telegram);

    if (!ctx.from) {
      next();
    }
    const { username, first_name: firstName, last_name: lastName, id: telegramId } = ctx.from;
    // TODO temp solution for testing
    const clients = [{ accessKey: 'some-random-text', type: 'public', name: 'home-pig' }];
    const selectedClients = [{ accessKey: 'some-random-text', type: 'public', name: 'home-pig' }];
    try {
      ctx.user = (await User.findOneAndUpdate(
        { telegramId: telegramId.toString() },
        { telegramId: telegramId.toString(), username, firstName, lastName, clients, selectedClients },
        { upsert: true, setDefaultsOnInsert: true, new: true },
      )).toJSON();
    } catch (error) {
      ctx.reply(this.i18n.translate('unexpected_error', ctx.user.settings.locale));
      next(error);
    }
    next();
  }

  extendContext() {
    this.bot.context.replyAndTranslate = (message, ctx) => ctx.reply(this.i18n.translate(message, ctx.user.settings.locale));
  }

  // workWithDocument(ctx) {
  //   if (ctx.message.document.mime_type !== 'audio/mp3') {
  //     return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
  //   }
  //   return this.workWithAudio(ctx, ctx.message.document)
  //     .catch((error) => this.telegramErrorLogging(error, ctx));
  // }

  async start() {
    await this.commandProcessor.initializeCommands();
    this.extendContext();

    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));

    this.commandProcessor.getCommands().forEach((command) => {
      if (command.name) {
        this.bot[command.type](command.name, ((ctx) => command.execute(ctx)));
      } else {
        this.bot[command.type](((ctx) => command.execute(ctx)));
      }
    });

    // this.bot.on('document', (ctx) => this.workWithDocument(ctx));
    this.bot.on('message', (ctx) => ctx.replyAndTranslate('no_idea_what_to_do', ctx));

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
