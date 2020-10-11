export default class ValidationError extends Error {
  constructor(message) {
    if (Array.isArray(message)) {
      super(message.map(elem => elem.text).join(' '));
    } else {
      super(message);
    }
    this.name = 'ValidationError';
  }
}
