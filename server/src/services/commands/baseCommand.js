const i18nService = require('../i18nService');
const User = require('../../models/users');

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
    if (this.ctx.updateType === 'callback_query') {
      return Promise.all([
        this.ctx.answerCbQuery(this.translate(input)),
        this.ctx.reply(this.translate(input), ...args),
      ]);
    }
    return this.ctx.reply(this.translate(input), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  async updateUser(ctx, update) {
    ctx.user = (await User.findOneAndUpdate(
      { telegramId: ctx.user.telegramId },
      update,
      { upsert: true, setDefaultsOnInsert: true, new: true },
    )).toJSON();
  }

  execute(ctx) {
    this.ctx = ctx;
  }
};
