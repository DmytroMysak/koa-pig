const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
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

const clientSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    unique: true,
    required: true,
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
  settings: {
    type: settingSchema,
    required: true,
    default: () => ({
      volume: 100,
      locale: 'ua',
      voiceId: 'Maxim',
    }),
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
  clients: [clientSchema],
  selectedClients: [clientSchema],
}, {
  timestamps: true,
});

userSchema.index({ telegramId: 1 });

const User = mongoose.model('users', userSchema);
module.exports = User;
