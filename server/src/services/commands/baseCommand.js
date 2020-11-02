const i18nService = require('../i18nService');

module.exports = class BaseCommand {
  constructor() {
    this.i18n = i18nService;
    this.voiceChangePrefix = 'voiceChange_';
    this.languageChangePrefix = 'languageChange_';
    this.localeChangePrefix = 'localeChange_';
  }

  translate(input) {
    let text;
    if (Array.isArray(input)) {
      text = input.map((elem) => {
        if (elem.translate) {
          return i18nService.translate(elem.text, this.ctx.user.settings.locale);
        }
        return elem.text;
      });
    } else {
      text = i18nService.translate(input, this.ctx.user.settings.locale);
    }
    return text;
  }

  sendResponseAndTranslate(input, ...args) {
    // if (this.ctx.updateType === 'callback_query') {
    //   return this.ctx.answerCbQuery(this.translate(input), ...args);
    // }
    return this.ctx.reply(this.translate(input), ...args);
  }

  execute(ctx) {
    this.ctx = ctx;
  }
};
