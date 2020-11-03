FROM node:14.15.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY src/ src/
COPY locales/ locales/

EXPOSE: 5000

CMD ["npm", "run", "start:prod"]
