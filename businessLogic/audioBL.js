import Player from 'play-sound';
import fs from 'fs';
import config from '../config/env';

export default class Audio {
  constructor() {
    // Create the songs directory if it does not exist
    if (!fs.existsSync(config.folderToSaveSongs)) {
      fs.mkdirSync(config.folderToSaveSongs);
    }
    this.player = new Player();
  }

  saveStreamToFile(audioData, stream) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(audioData.pathToFile);
      writeStream.end(stream.AudioStream);
      writeStream
        .on('finish', () => resolve())
        .on('error', () => reject());
    });
  }

  playSong(audioData) {
    return this.player.play(audioData.pathToFile, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}
