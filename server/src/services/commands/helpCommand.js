const BaseCommand = require('./baseCommand');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super();
    this.name = null;
    this.type = 'help';
  }

  async execute(ctx) {
    const commandListText = this.i18n.translate('command_list:', ctx.user.settings.locale);
    const callMenuText = this.i18n.translate('call_menu', ctx.user.settings.locale);
    const returnCurrentVoiceText = this.i18n.translate('return_current_voice', ctx.user.settings.locale);
    const changeVoiceHelpText = this.i18n.translate('change_voice_help', ctx.user.settings.locale);
    const stopCurrentAudioText = this.i18n.translate('stop_current_audio', ctx.user.settings.locale);
    const changeVolumeHelpText = this.i18n.translate('change_volume_help', ctx.user.settings.locale);
    return ctx.reply(`${commandListText}\n  ${callMenuText}\n  ${returnCurrentVoiceText}\n  ${changeVoiceHelpText}
  ${stopCurrentAudioText}\n  ${changeVolumeHelpText}`);
  }
};
