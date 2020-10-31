const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');
const voiceService = require('../voiceService');

module.exports = class ChangeVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['change'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('change_voice');
  }

  execute(ctx) {
    const languageListButton = voiceService.getLanguagesList()
      .map((el) => Markup.callbackButton(el.name, `${this.languageChangePrefix}${el.code}`));

    return ctx.reply(
      this.i18n.translate('voice_list'),
      Markup.inlineKeyboard(languageListButton, { columns: 2 }).extra(),
    );
  }
};
