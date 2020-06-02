# For installing npm dependencies and building static css/js
FROM node:10-alpine
COPY ./webpack.config.js ./tsconfig.json ./package.json yarn.lock /app/
COPY src /app/src
COPY conf /app/conf
WORKDIR /app

# Install npm dependencies and build static css/js
ENV PRODUCTION=true
RUN yarn run build && rm -rf node_modules

# Set up python
FROM python:3.7-alpine
# FROM kbase/kb_python:python3
COPY --from=0 /app /app
COPY requirements.txt /app
WORKDIR /app

RUN apk add --no-cache openssl

# ENV DOCKERIZE_VERSION v0.6.1
# RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#     && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
#     && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN apk --update add --virtual build-dependencies python-dev build-base && \
    pip install --upgrade pip && \
    pip install --upgrade --no-cache-dir -r requirements.txt && \
    apk del build-dependencies

ENV PYTHONPATH=/app

CMD ["python", "/app/src/server.py"]

# ENTRYPOINT [ "dockerize" ]
# CMD [ "--template", \
#       "/app/conf/deploy.json.templ:/app/src/static/config.json", \
#       "python", \
#       "/app/src/server.py" ]
