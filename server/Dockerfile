FROM node:14.15.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY src/ src/
COPY locales/ locales/

CMD ["npm", "run", "start:prod"]
