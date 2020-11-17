const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');
const SelectedStateCommand = require('./selectedStateCommand');
const ChangeVoiceCommand = require('./changeVoiceCommand');
const MenuCommand = require('./menuCommand');
const voiceService = require('../voiceService');

module.exports = class CallbackCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'callback_query';
  }

  async execute(ctx) {
    super.execute(ctx);

    if (ctx.callbackQuery.data === '/selected') {
      return new SelectedStateCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === '/changeVoice') {
      return new ChangeVoiceCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.voiceChangePrefix)) {
      return this.changeVoice(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.languageChangePrefix)) {
      return this.changeLanguage(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.localeChangePrefix)) {
      return this.changeLocale(ctx);
    }
    return this.sendResponseAndTranslate('no_idea_what_to_do');
  }

  async changeVoice(ctx) {
    const voiceId = ctx.callbackQuery.data.replace(this.voiceChangePrefix, '');
    await this.updateUser(ctx, { 'settings.voiceId': voiceId });

    return this.sendResponseAndTranslate('voice_changed');
  }

  async changeLanguage(ctx) {
    const languageId = ctx.callbackQuery.data.replace(this.languageChangePrefix, '');
    const voiceList = voiceService.getVoicesList(languageId);
    const voicesKeyboard = Markup.inlineKeyboard(
      voiceList.map((el) => Markup.callbackButton(
        `${el.name}(${el.gender}, ${el.languageCode})`,
        `${this.voiceChangePrefix}${el.id}`,
      )),
      { columns: 2 },
    ).extra();

    return this.sendResponseAndTranslate('voice_list', voicesKeyboard);
  }

  async changeLocale(ctx) {
    const locale = ctx.callbackQuery.data.replace(this.localeChangePrefix, '');
    await this.updateUser(ctx, { 'settings.locale': locale });
    const menu = new MenuCommand().getMenu(ctx);

    return this.sendResponseAndTranslate('localization_changed', menu);
  }
};
