import BaseCommand from './baseCommand';

export default class LanguagesCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['language', 'l'];
    this.type = 'command';
  }

  async execute(ctx) {
    const languageList = await this.voiceService.getLanguagesList(true);
    const buttonNameFunction = (elem) => elem.name;
    const buttonIdFunction = (elem) => `${this.languageChangePrefix}${elem.code}`;
    const list = await this.createInlineKeyboard(languageList.rows, 3, buttonNameFunction, buttonIdFunction);
    await this.sendResponseAndTranslate('language_list:', ctx);
    return ctx.reply(list);
  }
}
