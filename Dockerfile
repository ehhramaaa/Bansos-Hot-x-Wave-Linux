FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    openvpn

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN chmod +x ./start.sh

ENTRYPOINT ["sh", "/app/start.sh"]