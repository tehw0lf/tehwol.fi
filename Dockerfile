FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/apps/tehwolfi/browser /usr/share/nginx/html
