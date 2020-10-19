const i18nService = require('../i18nService');

module.exports = class BaseCommand {
  constructor() {
    this.i18n = i18nService;
    this.voiceChangePrefix = 'voiceChange_';
    this.localeChangePrefix = 'localeChange_';
  }

  sendResponseAndTranslate(input, ctx) {
    let text;
    if (Array.isArray(input)) {
      text = input.map((elem) => {
        if (elem.translate) {
          return this.i18n.translate(elem.text, ctx.user.settings.locale);
        }
        return elem.text;
      });
    } else {
      text = this.i18n.translate(input, ctx.user.settings.locale);
    }
    if (ctx.updateType === 'callback_query') {
      return ctx.answerCbQuery(text);
    }
    return ctx.reply(text);
  }
};
