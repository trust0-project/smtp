FROM node:lts
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

WORKDIR /usr/src/app
ENV PORT=61080
EXPOSE $PORT
CMD ["node", "build/index.js"]