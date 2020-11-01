FROM node:14.15.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY src/ src/
COPY locales/ locales/
# TODO remove later
COPY .env .env
COPY service-account.json service-account.json

ENV NODE_ENV=production

CMD ["npm", "run", "start:prod"]
