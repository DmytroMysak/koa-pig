const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');

module.exports = class AudioCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'audio';
  }

  async execute(ctx) {
    super.execute(ctx);
    let link;
    try {
      link = await ctx.telegram.getFileLink(ctx.update.message.audio.file_id);
    } catch {
      // TO DO, send error file too big
      debugger;
    }

    return clientService.sendToClients({
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
      link,
      command: 'play-song-telegram',
    }, ctx.user.selectedClients);
  }
};
