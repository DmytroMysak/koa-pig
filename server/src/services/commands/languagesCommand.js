const BaseCommand = require('./baseCommand');
const voiceService = require('../voiceService');

module.exports = class LanguagesCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['language', 'l'];
    this.type = 'command';
  }

  async execute(ctx) {
    const languageList = voiceService.getLanguagesList();
    const buttonNameFunction = (elem) => elem.name;
    const buttonIdFunction = (elem) => `${this.languageChangePrefix}${elem.code}`;
    const list = await this.createInlineKeyboard(languageList, 3, buttonNameFunction, buttonIdFunction);

    this.sendResponseAndTranslate('language_list:', ctx);
    return ctx.reply(list);
  }
};
