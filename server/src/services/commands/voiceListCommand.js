const BaseCommand = require('./baseCommand');
const voiceService = require('../voiceService');

module.exports = class VoiceListCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['voice', 'v'];
    this.type = 'command';
  }

  async execute(ctx, languageId = null) {
    const voiceList = voiceService.getVoicesList(languageId);
    const buttonNameFunction = (elem) => `${elem.name}(${elem.gender}, ${elem.languageCode})`;
    const buttonIdFunction = (elem) => `${this.voiceChangePrefix}${elem.id}`;
    const list = await this.createInlineKeyboard(voiceList.rows, 2, buttonNameFunction, buttonIdFunction);

    this.sendResponseAndTranslate('voice_list:', ctx);
    return ctx.reply(list);
  }
};
