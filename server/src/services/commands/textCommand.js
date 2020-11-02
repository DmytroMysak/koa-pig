const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');
const { createFileLink, createFileName } = require('../../helper/util');
const bucketService = require('../bucketService');
const awsService = require('../awsService');

// eslint-disable-next-line max-len
const isUrl = (text) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(text.toString());

module.exports = class TextCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'text';
  }

  async execute(ctx) {
    super.execute(ctx);
    const { message: { text } } = ctx;

    if (text.length > 1500) {
      return this.sendResponseAndTranslate('sorry_to_big');
    }
    if (isUrl(text)) {
      return this.processUrl(text, ctx);
    }
    return this.processText(text, ctx);
  }

  async processUrl(text, ctx) {
    // TODO
    return this.sendResponseAndTranslate('no_idea_what_to_do');

    if (!text.includes('youtube')) {
      return this.sendResponseAndTranslate('sorry_only_youtube');
    }

    return clientService.sendToClients({
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
      link: text,
      command: 'play-song-youtube',
    }, ctx.user.selectedClients);
  }

  async processText(text, ctx) {
    const fileName = createFileName(text, ctx.user.settings.voiceId);

    if (!(await bucketService.isExistFile(fileName))) {
      const file = await awsService.createAudioFileFromText(text, ctx.user.settings.voiceId);
      await bucketService.uploadFile(fileName, file);
    }

    return Promise.all([
      this.sendAudio(text, fileName, ctx),
      clientService.sendToClients({
        volume: ctx.user.settings.volume,
        chatId: ctx.chat.id,
        link: createFileLink(fileName),
        command: 'play-song-bucket',
      }, ctx.user.selectedClients),
    ]);
  }

  // eslint-disable-next-line class-methods-use-this
  async sendAudio(text, fileName, ctx) {
    const title = text.length > 13 ? `${text.substring(0, 10)}...` : text;
    return ctx.replyWithAudio({ url: createFileLink(fileName), filename: title }, {
      performer: 'Little Pig Bot',
      title,
      disable_notification: true,
      reply_to_message_id: ctx.message.message_id,
    });
  }
};
