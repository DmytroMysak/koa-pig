# bot-pig client
Just speak and cache song

## Goal
- easy install
- have queue
- have unique identify


// old

## Install

```sh
sudo apt-get install mplayer ffmpeg;
```
if you have some problem with installing ffmpeg, use static build from https://johnvansickle.com/ffmpeg/
then add to .env file FFMPEG_PATH=/full/path/to/ffmpeg/ffmpeg

if you don't have postgresql install it or use remote one but don't forget to change credential in config/env or .env file
```sh
sudo apt-get install postgresql-client postgresql postgresql-contrib;
```
Add new user or use user which already exist
```sh
sudo -u postgres createuser -D -A -P littlePig;
```
Create new DB
```sh
sudo -u postgres createdb -O littlePig little_pig;
```
add extension to new DB
```sh
sudo su - postgres;
psql little_pig;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
exit;
```

create .env file
```sh
touch .env;
```

fill in this file with:
```
AWS_ACCESS_KEY_ID=<YOUR AWS accessKeyId>
AWS_SECRET_ACCESS_KEY=<YOUR AWS secretAccessKey>
AWS_REGION=<YOUR AWS REGION>
DB_PASSWORD=<PASSWORD TO DB>
TELEGRAM_VERITY_TOKEN=<TELEGRAM_BOT_TOKEN>
```

Don't forget to use AWS POLLY.

## Getting Started

to start app enter:
./start-prod.sh

## TODO

- [x] delete unused package
     - axios
     - body-parser
     - compression
     - cors
     - express
     - express-winston
     - helmet
- [x] ngrock own wrapper or use ngrock analog
- [ ] use mjs or require(to delete gulp, babel etc)
- [ ] change winston
- [ ] pm2 analog
- [ ] add funny response for sticker or photo

