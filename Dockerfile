FROM node:latest as build-stage
WORKDIR /app
COPY . ./

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/backend
RUN npm install --production

# FROM nginx as production-stage
# COPY --from=build-stage /app/backend .
# COPY nginx.conf /etc/nginx/nginx.conf

# replace this with your application's default port
FROM node:latest as prduction-stage
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY --from=build-stage /app/backend .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["npm", "start"]
