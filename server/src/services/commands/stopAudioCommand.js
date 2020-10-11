import BaseCommand from './baseCommand';

export default class StopAudioCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['stop', 's'];
    this.type = 'command';
  }

  async execute(ctx) {
    return this.audio.stopSong();
  }
}
