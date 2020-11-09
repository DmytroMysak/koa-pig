const fs = require('fs');
const conventionalChangelog = require('conventional-changelog');
const config = require('cz-conventional-changelog');

conventionalChangelog({ config, releaseCount: 0 }).pipe(fs.createWriteStream('./CHANGELOG.md'));
