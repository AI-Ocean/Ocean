FrOM node:lts-alpine

ENV NODE_ENV production
ENV PORT 3000

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production
COPY . .

EXPOSE $PORT
CMD ["yarn", "start"]
