FROM node:10

ENV HOME /usr/src/
ENV NODE_ENV production
ENV PORT 3000

WORKDIR $HOME

COPY backend/package*.json ./
RUN yarn
COPY . .

EXPOSE 3000
CMD ["yarn", "start"]
