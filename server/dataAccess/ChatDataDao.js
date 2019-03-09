import _ from 'lodash';
import sequelize from '../models';

export default class ChatDataDao {
  constructor(models) {
    this.chatData = models.chatData;
  }

  saveChatData(chatDataObject) {
    return this.chatData.create(chatDataObject, { returning: true });
  }

  updateChatData(id, chatDataObject, fieldsToUpdate = null) {
    const updatedFields = _.omit(this.chatData.attributes, ['id', 'createdAt']);

    return this.chatData.update(
      chatDataObject,
      {
        fields: fieldsToUpdate || Object.keys(updatedFields),
        where: { id },
        returning: true,
      },
    )
      .then(([affectedRows, rows]) => (affectedRows && rows[0]) || {});
  }

  addAudioIdByHash(messageId, hash) {
    return this.chatData.update(
      { audioId: sequelize.literal(`(select id from "audioData" where "fileName" = '${hash}')`) },
      {
        fields: ['audioId'],
        where: { id: messageId },
        returning: true,
      },
    );
  }
}
