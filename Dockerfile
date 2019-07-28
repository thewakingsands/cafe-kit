FROM node:10
ADD . /app
WORKDIR /app
RUN yarn && \
  yarn build && \
  cp -r pkgs/webapp/build pkgs/mumble-bot/public && \
  find ./pkgs/mumble-bot/public -name '*.map' -delete && \
  yarn --production && \
  rm -rf /app/node_modules/ffmpeg-static/bin/win32 && \
  rm -rf /app/node_modules/ffmpeg-static/bin/darwin && \
  rm -rf /app/node_modules/ffmpeg-static/bin/linux/ia32 && \
  rm -rf /app/node_modules/ffprobe-static/bin/win32 && \
  rm -rf /app/node_modules/ffprobe-static/bin/darwin && \
  rm -rf /app/node_modules/ffprobe-static/bin/linux/ia32

FROM node:10-slim
COPY --from=0 /app /app
WORKDIR /app/pkgs/mumble-bot
CMD ["node", "dist/app.js"]
