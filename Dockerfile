# For installing npm dependencies and building static css/js
FROM node:16-alpine3.14
COPY ./webpack.config.js ./tsconfig.json ./package.json yarn.lock /app/
COPY src /app/src
WORKDIR /app

# Install npm dependencies and build static css/js
ENV PRODUCTION=true
RUN yarn build && rm -rf node_modules

# Set up python
FROM python:3.7-alpine
# FROM kbase/kb_python:python3
COPY --from=0 /app /app
COPY requirements.txt /app
WORKDIR /app

RUN apk add --no-cache openssl

RUN apk --update add --virtual build-dependencies python3-dev build-base && \
    pip install --upgrade pip && \
    pip install --upgrade --no-cache-dir -r requirements.txt && \
    apk del build-dependencies

ENV PYTHONPATH=/app

CMD ["python", "/app/src/server.py"]

ARG BUILD_DATE
ARG BRANCH
ARG VCS_REF
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.vcs-url="https://github.com/kbaseIncubator/dashboard-redesign.git"
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.schema-version="1.1.8"
LABEL us.kbase.vcs-branch=$BRANCH
LABEL maintainer="Dakota Blair dblair@bnl.gov"
