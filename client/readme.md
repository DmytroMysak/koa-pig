## Little pig bot client
Just speak song from telegram

### Goal
- [ ] docker image for client


###Require:
for speaker, fluent-ffmpeg libraries
```sh
sudo apt-get install libasound2-dev
sudo apt-get install ffmpeg
```

###Install
```sh
npm i
```

###Start
```sh
npm run start:prod
```

### Start (using pm2)

####Install pm2
```sh
npm i -g pm2
pm2 startup
# run script from console
```

####start app
```sh
npm run start:pm2
```
