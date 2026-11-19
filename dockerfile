FROM node:22.23-alpine3.23 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:stable-alpine

COPY --from=builder /app/www /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]