import mongoose, { Schema } from 'mongoose';

const settingSchema = new Schema({
  volume: {
    type: Number,
    default: 100,
    min: 1,
    max: 100,
  },
  locale: {
    type: String,
    default: 'ua',
    enum: ['en', 'ua'],
  },
  voiceId: {
    type: String,
    default: 'Maxim',
    max: 100,
  },
});

const clientSchema = new Schema({
  accessKey: {
    type: String,
    max: 100,
  },
  type: {
    type: String,
    enum: ['public', 'private'],
  },
  name: {
    type: String,
    max: 100,
  },
});

const userSchema = new Schema({
  telegramId: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  username: {
    type: String,
  },
  settings: settingSchema,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  clients: [clientSchema],
  selectedClients: [clientSchema],
}, {
  timestamps: true,
});

userSchema.index({ telegramId: 1 });

const User = mongoose.model('User', userSchema);
export default User;
