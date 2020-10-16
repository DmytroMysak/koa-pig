/* eslint-disable import/no-extraneous-dependencies */
const conventionalChangelog = require('conventional-changelog');
const config = require('cz-conventional-changelog');

conventionalChangelog({ config }).pipe(process.stdout); // or any writable stream
