import crypto from 'crypto';

export const createHash = (text) => {
  if (!text) {
    return null;
  }
  return crypto.createHash('sha1').update(text).digest('hex');
};
