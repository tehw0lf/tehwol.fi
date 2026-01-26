FROM nginx:alpine
RUN apk upgrade --no-cache libpng
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/apps/tehwolfde/browser /usr/share/nginx/html
