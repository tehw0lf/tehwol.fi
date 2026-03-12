FROM nginx:alpine-slim
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/apps/tehwolfde/browser /usr/share/nginx/html
