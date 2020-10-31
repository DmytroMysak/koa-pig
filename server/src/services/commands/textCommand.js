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
    const { message: { text } } = ctx;
    if (text.length > 1500) {
      return this.sendResponseAndTranslate('sorry_to_big', ctx);
    }
    const clientMessage = {
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
    };

    if (isUrl(text)) {
      if (!text.includes('youtube')) {
        return this.sendResponseAndTranslate('sorry_only_youtube', ctx);
      }
      return clientService.sendToClients({
        ...clientMessage,
        link: text,
        command: 'play-song-youtube',
      }, ctx.user.selectedClients);
    }

    const fileName = createFileName(text, ctx.user.settings.voiceId);

    if (!(await bucketService.isExistFile(fileName))) {
      const file = await awsService.createAudioFileFromText(text, ctx.user.settings.voiceId);
      await bucketService.uploadFile(fileName, file);
    }

    return clientService.sendToClients({
      ...clientMessage,
      link: createFileLink(fileName),
      command: 'play-song-bucket',
    }, ctx.user.selectedClients);
  }
};
