import { Extra, Markup } from 'telegraf';
import config from '../../../config/env';
import I18nService from '../i18nService';

export default class BaseCommand {
  constructor() {
    this.i18n = new I18nService();
  }

  // eslint-disable-next-line class-methods-use-this
  createInlineKeyboard(list, chuckSize, buttonNameFunction, buttonIdFunction) {
    const chuckedArray = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
    return Extra.HTML().markup((m) => m.inlineKeyboard(
      chuckedArray.map((array) => array.map((elem) => Markup.callbackButton(buttonNameFunction(elem), buttonIdFunction(elem)))),
    ));
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
}
