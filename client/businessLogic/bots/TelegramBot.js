/* eslint-disable no-console */
import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Extra from 'telegraf/extra';
import _ from 'lodash';
import Bot from './Bot';
import Audio from '../audioBL';
import logger from '../../helper/logger';
import validator from '../../helper/validator';
import PigService from '../pigBL';
import config from '../../config/env';
import UserDao from '../../dataAccess/UserDao';
import { models } from '../../models';

const { chatData: ChatDataModel } = models;

export default class TelegramBot extends Bot {
  /**
   * Represents a telegram bot.
   * @constructor
   * @param {string} appUrl
   */
  constructor(appUrl) {
    super();
    this.languageChangePrefix = 'language_change_';
    this.voiceChangePrefix = 'voice_change_';
    this.pigService = new PigService();
    this.audio = new Audio();
    this.userDao = new UserDao(models);
    this.bot = new Telegraf(config.telegramVerifyToken, { username: 'LittlePigBot' });
    this.bot.telegram.setWebhook(`${appUrl}${config.telegramPath}`);

    this.bot.use((ctx, next) => this.initMiddleware(ctx, next));
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
    this.bot.command(['menu', 'm'], ctx => this.menu(ctx));
    this.bot.command(['selected', 'sl'], ctx => this.sendSelectedVoice(ctx));
    this.bot.command(['language', 'l'], ctx => this.sendLanguageList(ctx));
    this.bot.command(['voice', 'v'], ctx => this.sendVoiceList(ctx));
    this.bot.command(['change', 'c'], ctx => this.sendChangeVoiceInstructions(ctx));
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
  }

  /**
   * Work with audio from message
   * @param {object} ctx
   * @param {object|null} data
   * @return {Promise}
   */
  workWithAudio(ctx, data = null) {
    const fileId = data.file_id || ctx.message.audio.file_id;
    return this.pigService.pigSpeakAudio(fileId, () => ctx.telegram.getFileLink(data || ctx.message.audio), ctx.user)
      .then(() => ctx.reply('Done'));
  }

  /**
   * Work with voice from message
   * @param {object} ctx
   * @return {Promise}
   */
  workWithVoice(ctx) {
    const fileId = ctx.message.voice.file_id;
    return this.pigService.pigSpeakAudio(fileId, () => ctx.telegram.getFileLink(ctx.message.voice), ctx.user)
      .then(() => ctx.reply('Done'));
  }

  /**
   * Work with text from message
   * @param {object} ctx
   * @return {Promise}
   */
  workWithText(ctx) {
    const { message: { text } } = ctx;
    if (validator.isUrl(text) && !text.includes('youtube')) {
      return ctx.reply('І що мені з цим робити?');
    }
    if (validator.isUrl(text)) {
      return this.pigService.pigSpeakFromUrl(text, ctx.user);
    }

    return ChatDataModel.build({ text, voiceId: ctx.user.selectedVoiceId || config.defaultVoiceId, userId: ctx.user.id })
      .validate()
      .then(chatData => this.pigService.pigSpeakText(chatData.get(), ctx.user))
      .then(audioData => ctx.replyWithAudio({ source: this.audio.getFullPathToFile(audioData.fileName) }));
  }

  /**
   * Work with document from message
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
   * Middleware to save user in db & add to context (ctx) for every request
   * @param {object} ctx
   * @param next
   */
  userMiddleware(ctx, next) {
    if (!ctx.from) {
      return next();
    }
    const {
      username, first_name: firstName, last_name: lastName, id: telegramId,
    } = ctx.from;

    return this.userDao.getUserByTelegramId(telegramId.toString())
      .then((user) => {
        if (!_.isEmpty(user)) {
          return user;
        }
        return this.userDao.addUser({
          telegramId: telegramId.toString(), username, firstName, lastName,
        });
      })
      .then((user) => {
        ctx.user = user.get();
        return next();
      })
      .catch(err => logger.error(err));
  }

  /**
   * Middleware to send default response for message & log message data
   * @param {object} ctx
   * @param next
   */
  initMiddleware(ctx, next) {
    if (!ctx.message || !ctx.message.text || ctx.message.text.startsWith('/')) {
      return next();
    }
    ctx.reply('Processing...');
    logger.info(ctx.message);
    return next();
  }

  /**
   * Send menu for user
   * @param {{reply}} ctx
   * @return {Promise}
   */
  menu({ reply }) {
    return reply('MENU', Extra.HTML().markup(m => m.inlineKeyboard([
      [Markup.callbackButton('Selected voice', '/s'), Markup.callbackButton('Change voice', '/c')],
      [Markup.callbackButton('Language list', '/l'), Markup.callbackButton('Voice list', '/v')],
    ])));
  }

  /**
   * Send instruction how to change voice
   * @param {object} ctx
   * @return {Promise}
   */
  sendChangeVoiceInstructions(ctx) {
    const text = `You have 2 options to change voice:
    - Press 'Language list' button, select language then select voice.
    - Press 'Voice list' button and select voice.`;
    return ctx.reply(text, Extra.HTML().markup(m => m.inlineKeyboard([
      Markup.callbackButton('Language list', '/l'), Markup.callbackButton('Voice list', '/v'),
    ])));
  }

  /**
   * Send user selected voice
   * @param {object} ctx
   * @return {Promise}
   */
  sendSelectedVoice(ctx) {
    if (!ctx.user.voice) {
      return ctx.reply(`${config.defaultVoiceId}(Male, Russian)`);
    }
    const voice = ctx.user.voice.get();
    return ctx.reply(`${voice.name}(${voice.gender}, ${voice.languageName})`);
  }

  /**
   * Send all available language
   * @param {object} ctx
   * @return {Promise}
   */
  sendLanguageList(ctx) {
    return this.pigService.getLanguagesList(true)
      .then((languageList) => {
        const buttonNameFunction = elem => elem.name;
        const buttonIdFunction = elem => `${this.languageChangePrefix}${elem.code}`;
        return this.createInlineKeyboard(languageList.rows, 3, buttonNameFunction, buttonIdFunction);
      })
      .then(list => ctx.reply('language list', list))
      .catch(error => logger.error(error));
  }

  /**
   * Send all available voice
   * @param {object} ctx
   * @param {string} languageId
   * @return {Promise}
   */
  sendVoiceList(ctx, languageId = null) {
    return this.pigService.getVoicesList(languageId)
      .then((voiceList) => {
        const buttonNameFunction = elem => `${elem.name}(${elem.gender}${languageId ? '' : `, ${elem.languageCode}`})`;
        const buttonIdFunction = elem => `${this.voiceChangePrefix}${elem.id}`;
        return this.createInlineKeyboard(voiceList.rows, languageId ? 3 : 2, buttonNameFunction, buttonIdFunction);
      })
      .then(list => ctx.reply('voice list', list))
      .catch(error => logger.error(error));
  }

  /**
   * Template for creating inline keyboard
   * @param {Array} list
   * @param {number} chuckSize
   * @param {function} buttonNameFunction
   * @param {function} buttonIdFunction
   * @return {string}
   */
  createInlineKeyboard(list, chuckSize, buttonNameFunction, buttonIdFunction) {
    const chuckedArray = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
    return Extra.HTML().markup(m => m.inlineKeyboard(
      chuckedArray.map(array => array.map(elem => Markup.callbackButton(buttonNameFunction(elem), buttonIdFunction(elem)))),
    ));
  }

  /**
   * change user voice by voiceId
   * @param {object} ctx
   * @param {string} voiceId
   * @return {Promise}
   */
  changeUserVoice(ctx, voiceId) {
    return this.userDao.updateUserVoiceId(ctx.user.id, voiceId)
      .then(() => ctx.reply('Voice changed'))
      .catch(error => logger.error(error));
  }

  /**
   * change user volume
   * @param {object} ctx
   * @return {Promise}
   */
  changeUserVolume(ctx) {
    const volume = parseInt(ctx.message.text.replace(/\D/gm, ''), 10);
    if (!volume || Number.isNaN(volume)) {
      return ctx.reply('Bad volume value');
    }
    return this.userDao.updateUserVolume(ctx.user.id, volume)
      .then(() => ctx.reply('Volume changed'))
      .catch(error => logger.error(error));
  }

  /**
   * start telegram bot
   * @return {Promise}
   */
  start() {
    this.bot.startWebhook(config.telegramPath, null, config.port);
    return Promise.resolve();
  }
}
