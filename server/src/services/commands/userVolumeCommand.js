import BaseCommand from './baseCommand';

export default class UserVolumeCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['volume', 'vl'];
    this.type = 'command';
  }

  async execute(ctx) {
    const volume = parseInt(ctx.message.text.replace(/\D/gm, ''), 10);
    if (!volume || Number.isNaN(volume)) {
      return this.sendResponseAndTranslate('bad_volume_value', ctx);
    }
    return this.userService.updateUserVolume(ctx.user.id, volume)
      .then(() => this.sendResponseAndTranslate('volume_changed', ctx));
  }
}
