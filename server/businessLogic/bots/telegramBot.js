import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import logger from '../../helper/logger';
import validator from '../../helper/validator';
import Localization from '../../helper/localization';
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
    this.localization = new Localization();
    this.appUrl = appUrl;
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot', telegram: { webhookReply: false } });
  }

  /**
   * Template for creating inline keyboard
   * @return {Promise}
   * @param {string|Array<{text: string, translate: boolean}>} input
   * @param {object} ctx
   */
  async sendResponseAndTranslate(input, ctx) {
    let text;
    if (Array.isArray(input)) {
      text = input.map(async (elem) => {
        if (elem.translate) {
          const translatedText = await this.localization.translate(elem.text, ctx.user.locale || config.defaultLocale);
          return translatedText;
        }
        return elem.text;
      });
    } else {
      text = await this.localization.translate(input, ctx.user.locale || config.defaultLocale);
    }
    return ctx.reply(text);
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
      logger.info(error.message.map(elem => elem.text).join(' '));
    } else {
      logger.info(error.message);
    }
    return this.sendResponseAndTranslate(error.message, ctx);
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

    try {
      ctx.user = await this.userService.upsertUserByTelegramId({
        telegramId: telegramId.toString(), username, firstName, lastName,
      });
      ctx.user.clients = await this.userService.getUserClients(ctx.user.id);
    } catch (error) {
      this.telegramErrorLogging(error, ctx);
      next(error);
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
      .catch(error => this.telegramErrorLogging(error, ctx));
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
      .catch(error => this.telegramErrorLogging(error, ctx));
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
        .catch(error => this.telegramErrorLogging(error, ctx));
    }
    const params = {
      text,
      voiceId: ctx.user.voiceId || config.defaultVoiceId,
      userId: ctx.user.id,
    };
    return this.serverService.processText(params, ctx.user.volume, ctx.user.clients)
      .catch(error => this.telegramErrorLogging(error, ctx));
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
      .catch(error => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  async sendChangeVoiceInstructions(ctx) {
    const languageListText = await this.localization.translate('language_list', ctx.user.locale);
    const voiceListText = await this.localization.translate('voice_list', ctx.user.locale);
    await this.sendResponseAndTranslate('change_voice_instructions', ctx);
    return ctx.reply(Extra.HTML().markup(m => m.inlineKeyboard([
      Markup.callbackButton(languageListText, '/l'),
      Markup.callbackButton(voiceListText, '/v'),
    ])));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  async sendMenu(ctx) {
    const selectedVoiceText = await this.localization.translate('selected_voice', ctx.user.locale);
    const changeVoiceText = await this.localization.translate('change_voice', ctx.user.locale);
    const languageListText = await this.localization.translate('language_list', ctx.user.locale);
    const voiceListText = await this.localization.translate('voice_list', ctx.user.locale);
    return ctx.reply('menu', Extra.HTML().markup(m => m.inlineKeyboard([
      [Markup.callbackButton(selectedVoiceText, '/s'), Markup.callbackButton(changeVoiceText, '/c')],
      [Markup.callbackButton(languageListText, '/l'), Markup.callbackButton(voiceListText, '/v')],
    ])));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  async sendCommandList(ctx) {
    const commandListText = await this.localization.translate('command_list:', ctx.user.locale);
    const callMenuText = await this.localization.translate('call_menu', ctx.user.locale);
    const returnCurrentVoiceText = await this.localization.translate('return_current_voice', ctx.user.locale);
    const changeVoiceHelpText = await this.localization.translate('change_voice_help', ctx.user.locale);
    const returnLanguageListText = await this.localization.translate('return_language_list', ctx.user.locale);
    const returnVoiceListText = await this.localization.translate('return_voice_list', ctx.user.locale);
    const stopCurrentAudioText = await this.localization.translate('stop_current_audio', ctx.user.locale);
    const changeVolumeHelpText = await this.localization.translate('change_volume_help', ctx.user.locale);
    return ctx.reply(`${commandListText}\n  ${callMenuText}\n  ${returnCurrentVoiceText}\n  ${changeVoiceHelpText}
  ${returnLanguageListText}\n  ${returnVoiceListText}\n  ${stopCurrentAudioText}\n  ${changeVolumeHelpText}`);
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
   * @return {Promise}
   */
  sendSelectedVoice(ctx) {
    if (!ctx.user.voice) {
      return ctx.reply(`${config.defaultVoiceId}(Male, Russian)`);
    }
    return this.userService.getUserVoice(ctx.user.id)
      .then(voice => ctx.reply(`${voice.name}(${voice.gender}, ${voice.languageName})`))
      .catch(error => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  async sendLanguageList(ctx) {
    try {
      const languageList = await this.voiceService.getLanguagesList(true);
      const buttonNameFunction = elem => elem.name;
      const buttonIdFunction = elem => `${this.languageChangePrefix}${elem.code}`;
      const list = await TelegramBot.createInlineKeyboard(languageList.rows, 3, buttonNameFunction, buttonIdFunction);
      await this.sendResponseAndTranslate('language_list:', ctx);
      return ctx.reply(list);
    } catch (error) {
      return this.telegramErrorLogging(error, ctx);
    }
  }

  /**
   * @param {object} ctx
   * @param {string|null} languageId
   * @return {Promise}
   */
  async sendVoiceList(ctx, languageId = null) {
    try {
      const voiceList = await this.voiceService.getVoicesList(languageId);
      const buttonNameFunction = elem => `${elem.name}(${elem.gender}${languageId ? '' : `, ${elem.languageCode}`})`;
      const buttonIdFunction = elem => `${this.voiceChangePrefix}${elem.id}`;
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
      .catch(error => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @param {object} ctx
   * @return {Promise}
   */
  changeUserVolume(ctx) {
    const volume = parseInt(ctx.message.text.replace(/\D/gm, ''), 10);
    if (!volume || Number.isNaN(volume)) {
      return this.sendResponseAndTranslate('bad_volume_value', ctx);
    }
    return this.userService.updateUserVolume(ctx.user.id, volume)
      .then(() => this.sendResponseAndTranslate('volume_changed', ctx))
      .catch(error => this.telegramErrorLogging(error, ctx));
  }

  /**
   * @return {Promise}
   */
  async start() {
    this.bot.use((ctx, next) => this.userMiddleware(ctx, next));
    this.bot.start(ctx => this.sendResponseAndTranslate('hello_message', ctx));
    this.bot.help(ctx => this.sendCommandList(ctx));
    this.bot.command(['menu', 'm'], ctx => this.sendMenu(ctx));
    this.bot.command(['change', 'c'], ctx => this.sendChangeVoiceInstructions(ctx));
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
    this.bot.on('message', ctx => this.sendResponseAndTranslate('no_idea_what_to_do', ctx));
    this.bot.catch((error) => {
      if (!error) {
        return;
      }
      if (error.name === 'ValidationError') {
        logger.info(error.message);
      }
      logger.error(error);
    });
    this.bot.launch({
      webhook: {
        domain: `${this.appUrl}${config.telegramPath}`,
        port: this.port,
      },
    });
  }
}
