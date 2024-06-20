FROM zenika/alpine-chrome:with-puppeteer-xvfb

# hadolint ignore=DL3002
USER root

# hadolint ignore=DL3018
RUN apk upgrade --no-cache --available && \
  apk update && \
  apk add --no-cache \
  x11vnc \
  && \
  apk add --update --no-cache tzdata && \
  cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  echo "Asia/Tokyo" > /etc/timezone && \
  apk del tzdata

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY src/ src/
COPY tsconfig.json .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

VOLUME [ "/data" ]

ENTRYPOINT ["tini", "--"]
CMD ["/app/entrypoint.sh"]
