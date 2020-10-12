const { Extra, Markup } = require('telegraf');
const I18nService = require('../i18nService');

module.exports = class BaseCommand {
  constructor() {
    this.i18n = new I18nService();
    this.languageChangePrefix = 'languageChange_';
    this.voiceChangePrefix = 'voiceChange_';
  }

  // eslint-disable-next-line class-methods-use-this
  createInlineKeyboard(list, chuckSize, buttonNameFunction, buttonIdFunction) {
    const chuckedArray = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
    return Extra.HTML().markup((m) => m.inlineKeyboard(
      chuckedArray.map((array) => array.map((elem) => Markup.callbackButton(buttonNameFunction(elem), buttonIdFunction(elem)))),
    ));
  }

  sendResponseAndTranslate(input, ctx) {
    let text;
    if (Array.isArray(input)) {
      text = input.map((elem) => {
        if (elem.translate) {
          return this.i18n.translate(elem.text, ctx.user.locale);
        }
        return elem.text;
      });
    } else {
      text = this.i18n.translate(input, ctx.user.locale);
    }
    return ctx.reply(text);
  }
};
