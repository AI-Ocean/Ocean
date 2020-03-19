FROM node:latest as build-stage
WORKDIR /app
COPY frontend/package.json /app/
RUN npm install
COPY backend/ .
RUN npm run build

FROM nginx as production-stage
COPY --from=build-stage /app .
COPY nginx.conf /etc/nginx/nginx.conf

# replace this with your application's default port
EXPOSE 8080
CMD [ "npm", "start" ]
