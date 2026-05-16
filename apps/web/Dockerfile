FROM node:23-alpine3.20

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

ARG GRAPHITE_HOST
ARG PG_DATABASE_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
