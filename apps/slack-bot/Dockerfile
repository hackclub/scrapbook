FROM node:23-alpine3.20

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# USER node

RUN npm ci

COPY . .

# generate prisma client
RUN npx prisma generate 

EXPOSE 3001
CMD ["npm", "start"]
