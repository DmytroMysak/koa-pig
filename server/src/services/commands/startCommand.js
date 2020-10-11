import BaseCommand from './baseCommand';

export default class StartCommand extends BaseCommand {
  constructor() {
    super();
    this.name = null;
    this.type = 'start';
  }

  async execute(ctx) {
    const text = this.i18n.translate('hello_message', ctx.user.locale);
    return ctx.reply(text);
  }
}
