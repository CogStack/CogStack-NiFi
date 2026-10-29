FROM nginx@sha256:600f7cd45e27aa13e9304c834ab7c1b0ff39df85ee1dcc5087955455d77bc83b

# Add configuration
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# Add site
RUN rm -rf /etc/nginx/sites-enabled
RUN mkdir /etc/nginx/sites-enabled/
