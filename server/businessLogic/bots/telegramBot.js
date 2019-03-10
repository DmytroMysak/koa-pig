import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import logger from '../../helper/logger';
import validator from '../../helper/validator';
import UserService from '../userBL';
import VoiceService from '../voiceBL';
import config from '../../config/env/index';

export default class TelegramBot {
  /**
   * Represents a telegram bot.
   * @constructor
   * @param {string} appUrl
   * @param {number} port
   * @param {object} serverService
   */
  constructor(appUrl, port, serverService) {
    this.port = port;
    this.languageChangePrefix = 'lc_';
    this.voiceChangePrefix = 'vc_';
    this.serverService = serverService;
    this.userService = new UserService();
    this.voiceService = new VoiceService();
    this.appUrl = appUrl;
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot', telegram: { webhookReply: false } });
  }

  /**
   * Template for creating inline keyboard
   * @param {Array} list
   * @param {number} chuckSize
   * @param {function} buttonNameFunction
   * @param {function} buttonIdFunction
   * @return {string}
   */
  static createInlineKeyboard(list, chuckSize, buttonNameFunction, buttonIdFunction) {
    const chuckedArray = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
    return Extra.HTML().markup(m => m.inlineKeyboard(
      chuckedArray.map(array => array.map(elem => Markup.callbackButton(buttonNameFunction(elem), buttonIdFunction(elem)))),
    ));
  }

  /**
   * Middleware to save user in db & add to context (ctx) for every request
   * @param {object} ctx
   * @param next
   */
  async userMiddleware(ctx, next) {
    logger.info(ctx.message);
    if (!ctx.from) {
      next();
    }
    const {
      username, first_name: firstName, last_name: lastName, id: telegramId,
    } = ctx.from;
    const role = config.superAdminIds.includes(telegramId) ? 'ADMIN' : 'USER';

    try {
      ctx.user = await this.userService.upsertUserByTelegramId({
        telegramId: telegramId.toString(), username, firstName, lastName, role,
      });
      // todo get user clients and set to ctx.user.clients as list of client name
      ctx.user.clients = ['xxx'];
    } catch (error) {
      logger.error(error);
    }
    next();
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
      .then(() => ctx.reply('Done'));
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
      .then(() => ctx.reply('Done'));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  workWithText(ctx) {
    const { message: { text } } = ctx;
    if (validator.isUrl(text) && !text.includes('youtube')) {
      return ctx.reply('Sorry, only youtube for now');
    }

    if (validator.isUrl(text)) {
      return this.serverService.processUrl({ url: text, userId: ctx.user.id }, ctx.user.volume, ctx.user.clients);
    }
    const params = {
      text,
      voiceId: ctx.user.selectedVoiceId || config.defaultVoiceId,
      userId: ctx.user.id,
    };
    return this.serverService.processText(params, ctx.user.volume, ctx.user.clients);
    // .then(filePath => ctx.replyWithAudio({ source: filePath }));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  workWithDocument(ctx) {
    if (ctx.message.document.mime_type !== 'audio/mp3') {
      return ctx.reply('І що мені з цим робити?');
    }
    return this.workWithAudio(ctx, ctx.message.document);
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
    return ctx.reply('І що мені з цим робити?');
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  sendSelectedVoice(ctx) {
    if (!ctx.user.voice) {
      return ctx.reply(`${config.defaultVoiceId}(Male, Russian)`);
    }
    return this.userService.getUserVoice(ctx.user.id)
      .then(voice => ctx.reply(`${voice.name}(${voice.gender}, ${voice.languageName})`));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  sendLanguageList(ctx) {
    return this.voiceService.getLanguagesList(true)
      .then((languageList) => {
        const buttonNameFunction = elem => elem.name;
        const buttonIdFunction = elem => `${this.languageChangePrefix}${elem.code}`;
        return TelegramBot.createInlineKeyboard(languageList.rows, 3, buttonNameFunction, buttonIdFunction);
      })
      .then(list => ctx.reply('Language list:', list))
      .catch(error => logger.error(error));
  }

  /**
   * @param {object} ctx
   * @param {string|null} languageId
   * @return {Promise}
   */
  sendVoiceList(ctx, languageId = null) {
    return this.voiceService.getVoicesList(languageId)
      .then((voiceList) => {
        const buttonNameFunction = elem => `${elem.name}(${elem.gender}${languageId ? '' : `, ${elem.languageCode}`})`;
        const buttonIdFunction = elem => `${this.voiceChangePrefix}${elem.id}`;
        return TelegramBot.createInlineKeyboard(voiceList.rows, languageId ? 3 : 2, buttonNameFunction, buttonIdFunction);
      })
      .then(list => ctx.reply('Voice list:', list))
      .catch(error => logger.error(error));
  }

  /**
   * @param {object} ctx
   * @param {string} voiceId
   * @return {Promise}
   */
  changeUserVoice(ctx, voiceId) {
    return this.userService.updateUserVoiceId(ctx.user.id, voiceId)
      .then(() => ctx.reply('Voice changed'))
      .catch(error => logger.error(error));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  changeUserVolume(ctx) {
    const volume = parseInt(ctx.message.text.replace(/\D/gm, ''), 10);
    if (!volume || Number.isNaN(volume)) {
      return ctx.reply('Bad volume value');
    }
    return this.userService.updateUserVolume(ctx.user.id, volume)
      .then(() => ctx.reply('Volume changed'))
      .catch(error => logger.error(error));
  }

  /**
   * @return {Promise}
   */
  async start() {
    this.bot.telegram.setWebhook(`${this.appUrl}${config.telegramPath}`);
    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));
    this.bot.start(ctx => ctx.reply('Welcome! Write me some text. For more info use /help'));
    this.bot.help(ctx => ctx.reply(`command list:
    /menu or /m -> call menu
    /selected or /sl -> return current voice
    /change or /c -> help you to change voice change voice
    /language or /l -> return language list
    /voice or /v -> return voice list
    /stop or /s -> stop current audio
    /volume or /vl -> change volume 
        default value: -1
        range: -1<->10000, recommended range -1<->100
        e.g. /volume 100 (set volume to 100) 
        /vl 123 (set volume to 123)
        /volume   123 3 (set volume to 1233)
    `));
    this.bot.command(['menu', 'm'], ctx => ctx.reply('MENU', Extra.HTML().markup(m => m.inlineKeyboard([
      [Markup.callbackButton('Selected voice', '/s'), Markup.callbackButton('Change voice', '/c')],
      [Markup.callbackButton('Language list', '/l'), Markup.callbackButton('Voice list', '/v')],
    ]))));
    this.bot.command(['change', 'c'], ctx => ctx.reply(`You have 2 options to change voice:
    - Press 'Language list' button, select language then select voice.
    - Press 'Voice list' button and select voice.`, Extra.HTML().markup(m => m.inlineKeyboard([
      Markup.callbackButton('Language list', '/l'), Markup.callbackButton('Voice list', '/v'),
    ]))));
    this.bot.command(['selected', 'sl'], ctx => this.sendSelectedVoice(ctx));
    this.bot.command(['language', 'l'], ctx => this.sendLanguageList(ctx));
    this.bot.command(['voice', 'v'], ctx => this.sendVoiceList(ctx));
    this.bot.command(['stop', 's'], () => this.audio.stopSong());
    this.bot.command(['volume', 'vl'], ctx => this.changeUserVolume(ctx));
    this.bot.on('callback_query', ctx => this.workWithCallbackQuery(ctx));
    this.bot.on('text', ctx => this.workWithText(ctx));
    this.bot.on('audio', ctx => this.workWithAudio(ctx));
    this.bot.on('voice', ctx => this.workWithVoice(ctx));
    this.bot.on('document', ctx => this.workWithDocument(ctx));
    this.bot.on('message', ctx => ctx.reply('І що мені з цим робити?'));
    this.bot.catch((err) => {
      if (err) {
        logger.error(err);
      }
    });
    this.bot.startWebhook(config.telegramPath, null, this.port);
  }
}
