/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const conventionalChangelog = require('conventional-changelog');
const config = require('cz-conventional-changelog');

conventionalChangelog({ config }).pipe(fs.createWriteStream('./CHANGELOG.md'));
