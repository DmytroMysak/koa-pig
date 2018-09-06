import _ from 'lodash';

export default class AudioDataDao {
  constructor(models) {
    const { chatData, audioData } = models;
    this.chatData = chatData;
    this.audioData = audioData;
  }

  saveAudioData(audioDataObject) {
    return this.audioData.create(audioDataObject);
  }

  getAudioDataByText(filter) {
    return this.chatData.findOne({
      where: {
        ..._.isEmpty(filter) ? {} : filter,
      },
      include: [{ model: this.audioData, as: 'audio', required: true }],
    })
      .then(chatData => (_.isEmpty(chatData) && {}) || chatData.audio);
  }

  getAudioDataByFileId(fileId) {
    return this.audioData.findOne({ where: { fileId } })
  }
}
