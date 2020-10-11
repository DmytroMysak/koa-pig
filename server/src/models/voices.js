import mongoose, { Schema } from 'mongoose';

const voiceSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
  },
  languageCode: {
    type: String,
  },
  languageName: {
    type: String,
  },
  name: {
    type: String,
  },
}, {
  _id: false,
  id: false,
});

// userSchema.index({ telegramId: 1 });

const Voice = mongoose.model('Voice', voiceSchema);
export default Voice;
