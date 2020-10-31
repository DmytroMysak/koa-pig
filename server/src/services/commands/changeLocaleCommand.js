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
    return ctx.reply(
      this.i18n.translate('localization'),
      Markup.inlineKeyboard(
        this.i18n.localeList().map((locale) => (
          Markup.callbackButton(this.i18n.translate(locale), `${this.localeChangePrefix}${locale}`))),
      ).extra(),
    );
  }
};
