import BaseCommand from './baseCommand';

export default class VoiceListCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['voice', 'v'];
    this.type = 'command';
  }

  async execute(ctx) {
    const voiceList = await this.voiceService.getVoicesList();
    const buttonNameFunction = (elem) => `${elem.name}(${elem.gender}, ${elem.languageCode})`;
    const buttonIdFunction = (elem) => `${this.voiceChangePrefix}${elem.id}`;
    const list = await this.createInlineKeyboard(voiceList.rows, 2, buttonNameFunction, buttonIdFunction);
    await this.sendResponseAndTranslate('voice_list:', ctx);
    return ctx.reply(list);
  }
}
