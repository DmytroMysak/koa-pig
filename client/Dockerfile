FROM node:14.15.0-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY src/ src/
# TODO remove later
COPY .env .env

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
