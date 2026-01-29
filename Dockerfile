FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY favicon.svg /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
