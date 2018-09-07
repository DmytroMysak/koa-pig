#!/usr/bin/env bash
pm2 ./node_modules/.bin/pm2/stop bot-prod
pm2 ./node_modules/.bin/pm2/delete bot-prod
