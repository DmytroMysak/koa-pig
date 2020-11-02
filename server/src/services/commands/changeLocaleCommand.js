const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');

module.exports = class ChangeVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['locale'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('language');
  }

  execute(ctx) {
    super.execute(ctx);

    return this.sendResponseAndTranslate(
      'localization',
      Markup.inlineKeyboard(
        this.i18n.localeList().map((locale) => (
          Markup.callbackButton(this.translate(locale), `${this.localeChangePrefix}${locale}`))),
      ).extra(),
    );
  }
};
