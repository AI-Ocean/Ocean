FROM node:10 as frontend-build
WORKDIR /build
COPY frontend/package.json .
COPY frontend/yarn.lock .
RUN yarn
COPY frontend .
RUN yarn build

FROM node:10 as backend-build
WORKDIR /build
COPY backend/package*.json ./
RUN npm install --production
COPY backend .

FROM node:10 as prduction
ENV NODE_ENV production
ENV PORT 80

COPY --from=backend-build /build .
COPY --from=frontend-build /build/dist ./public
EXPOSE 80
CMD ["npm", "start"]
