#!/usr/bin/env bash
./node_modules/.bin/pm2 stop bot-prod
./node_modules/.bin/pm2 delete bot-prod
