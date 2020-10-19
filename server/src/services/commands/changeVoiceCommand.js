const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');
const voiceService = require('../voiceService');

module.exports = class ChangeVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['change', 'ch'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('change_voice');
  }

  execute(ctx, languageId = null) {
    const voiceList = voiceService.getVoicesList(languageId);
    const buttonNameFunction = (elem) => `${elem.name}(${elem.gender}, ${elem.languageCode})`;
    const buttonIdFunction = (elem) => `${this.voiceChangePrefix}${elem.id}`;

    return ctx.reply(
      this.i18n.translate('voice_list'),
      Markup.inlineKeyboard(
        voiceList.map((voice) => Markup.callbackButton(buttonNameFunction(voice), buttonIdFunction(voice))),
        { columns: 2 },
      ).extra(),
    );
  }
};
