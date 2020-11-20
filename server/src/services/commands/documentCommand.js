const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');

module.exports = class DocumentCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'document';
  }

  async execute(ctx) {
    super.execute(ctx);
    if (ctx.update.message.document.mime_type !== 'audio/mp3') {
      return this.sendResponseAndTranslate('no_idea_what_to_do');
    }
    const link = await ctx.telegram.getFileLink(ctx.update.message.document.file_id);

    return clientService.sendToClients({
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
      link,
      command: 'play-song-telegram',
    }, ctx.user);
  }
};
