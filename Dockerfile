FROM node:latest as build-stage
WORKDIR /app
COPY . ./

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/backend
RUN npm install --production

# FROM nginx as production-stage

# COPY nginx.conf /etc/nginx/nginx.conf

FROM node:latest as prduction-stage
ENV NODE_ENV production
ENV PORT 80

COPY --from=build-stage /app/backend .
EXPOSE 80
CMD ["npm", "start"]

# FROM nginx as production-stage
# COPY --from=build-stage /app/backend .
# COPY nginx.conf /etc/nginx/nginx.conf
