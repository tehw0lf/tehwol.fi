FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/apps/tehwolfde/browser /usr/share/nginx/html
