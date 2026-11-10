FROM nginx@sha256:600f7cd45e27aa13e9304c834ab7c1b0ff39df85ee1dcc5087955455d77bc83b

ARG NGINX_UID=1000
ARG NGINX_GID=1000

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl; \
    rm -rf /var/lib/apt/lists/*; \
    rm -f /etc/nginx/conf.d/default.conf; \
    groupmod -o -g "${NGINX_GID}" nginx; \
    usermod -o -u "${NGINX_UID}" nginx; \
    mkdir -p /etc/nginx/sites-enabled

COPY config/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/cogstack-nginx-entrypoint.sh
COPY --chmod=755 healthcheck.sh /usr/local/bin/cogstack-nginx-healthcheck.sh

ENV HOME=/tmp
USER ${NGINX_UID}:${NGINX_GID}
ENTRYPOINT ["/usr/local/bin/cogstack-nginx-entrypoint.sh"]
CMD []
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["/usr/local/bin/cogstack-nginx-healthcheck.sh", "ready"]
