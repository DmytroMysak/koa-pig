const BaseCommand = require('./baseCommand');
const ClientService = require('../clientService');

module.exports = class StopAudioCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['stop', 's'];
    this.type = 'command';
  }

  // eslint-disable-next-line class-methods-use-this
  async execute(ctx) {
    return ClientService.sendToClients({ command: 'stop-song' }, ctx.user.selectedClients);
  }
};
