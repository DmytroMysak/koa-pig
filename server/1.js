var conventionalChangelog = require('conventional-changelog');

conventionalChangelog({
  preset: 'eslint'
})
  .pipe(process.stdout); // or any writable stream
