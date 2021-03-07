FROM node:lts-alpine as build
WORKDIR /build
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:stable-alpine as prduction
RUN mkdir /app
COPY  nginx.conf /etc/nginx/nginx.conf
COPY --from=build /build/dist /app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
