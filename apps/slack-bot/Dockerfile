FROM node:23-alpine3.20

WORKDIR /app

COPY package.json .
COPY yarn.lock .

# USER node

# RUN npm install -g yarn
RUN yarn install

COPY . .

# generate prisma client
RUN npx prisma generate 

EXPOSE 3001
CMD ["yarn", "start"]