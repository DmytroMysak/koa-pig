const BaseCommand = require('./baseCommand');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super();
    this.name = null;
    this.type = 'help';
  }

  async execute(ctx) {
    const commandListText = this.i18n.translate('command_list:', ctx.user.locale);
    const callMenuText = this.i18n.translate('call_menu', ctx.user.locale);
    const returnCurrentVoiceText = this.i18n.translate('return_current_voice', ctx.user.locale);
    const changeVoiceHelpText = this.i18n.translate('change_voice_help', ctx.user.locale);
    const returnLanguageListText = this.i18n.translate('return_language_list', ctx.user.locale);
    const returnVoiceListText = this.i18n.translate('return_voice_list', ctx.user.locale);
    const stopCurrentAudioText = this.i18n.translate('stop_current_audio', ctx.user.locale);
    const changeVolumeHelpText = this.i18n.translate('change_volume_help', ctx.user.locale);
    return ctx.reply(`${commandListText}\n  ${callMenuText}\n  ${returnCurrentVoiceText}\n  ${changeVoiceHelpText}
  ${returnLanguageListText}\n  ${returnVoiceListText}\n  ${stopCurrentAudioText}\n  ${changeVolumeHelpText}`);
  }
};
