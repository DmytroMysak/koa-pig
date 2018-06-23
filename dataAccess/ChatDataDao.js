import _ from 'lodash';

export default class ChatDataDao {
  constructor(models) {
    this.chatData = models.chatData;
  }

  saveChatData(chatDataObject) {
    return this.chatData.upsert(chatDataObject, { returning: true });
  }

  updateChatData(id, chatDataObject, fieldsToUpdate = null) {
    const updatedFields = _.omit(this.chatData.attributes, ['id', 'date']);

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
}
