import _ from 'lodash';

export default class AudioDao {
  constructor(models) {
    this.audio = models.audio;
  }

  saveAudio(audio) {
    return this.audio.create(audio);
  }

  // getAudioByText(filter) {
  //   return this.messages.findOne({
  //     where: {
  //       ..._.isEmpty(filter) ? {} : filter,
  //     },
  //     include: [{ model: this.audio, as: 'audio', required: true }],
  //   })
  //     .then(messages => (_.isEmpty(messages) && {}) || messages.audio);
  // }
  //
  // getAudioByFileId(fileId) {
  //   return this.audio.findOne({ where: { fileId } });
  // }
}
