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
      ..._.isEmpty(filter) ? {} : { where: filter },
      include: [this.audioData],
    })
      .then(chatData => chatData.audioData);
  }
}
