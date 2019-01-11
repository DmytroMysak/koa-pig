#!/usr/bin/env bash
./node_modules/.bin/pm2 stop bot-dev
./node_modules/.bin/pm2 delete bot-dev
