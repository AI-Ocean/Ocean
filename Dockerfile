FROM node:latest as build-stage
WORKDIR /frontend
RUN npm install
RUN npm run build
WORKDIR /app
COPY backend/* .
RUN npm install

FROM nginx as production-stage
COPY --from=build-stage /app .
COPY nginx.conf /etc/nginx/nginx.conf

# replace this with your application's default port
# EXPOSE 8080
# CMD [ "npm", "start" ]
