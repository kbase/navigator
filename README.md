# KBase Narratives Navigator

[![Testing Status](https://github.com/kbase/dashboard-redesign/workflows/Tests/badge.svg)](https://github.com/kbase/dashboard-redesign/workflows/Tests/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/kbase/dashboard-redesign/badge.svg?branch=main)](https://coveralls.io/github/kbase/dashboard-redesign?branch=main)

- React
- Webpack
- Typescript
- Tachyons
- Backend: Sanic and jinja2

## Development

### Prerequisites

1. Install docker: <https://docs.docker.com/install>
2. Install docker-compose: <https://docs.docker.com/compose/install>
3. Install Node 16: <https://github.com/nvm-sh/nvm>
4. Install yarn: <https://yarnpkg.com/en/docs/install>

#### macOS Install Notes

- install `docker` (includes `docker-compose`) via [Docker Desktop](https://www.docker.com/products/docker-desktop)
- install `node` and `yarn` - with [macports](https://www.macports.org) or [brew](https://brew.sh)

### Run the server

In one terminal, run `make serve` to start the python server.

In another terminal, run `yarn watch` to start the bundler.

### Linting and formatting typescript

Run `yarn fix` to lint and auto-format your code using Prettier. Run `yarn test` to run the test suite. Note that if Prettier complains, then tests will fail.

### Troubleshooting

Run `make reset` to do a hard reset of your docker build, deleting containers and volumes.

## Dockerfiles

There are a few dockerfiles:

- `Dockerfile` - production image
- `dev/Dockerfile-python` - development python image
- `dev/Dockerfile-node` - development js/css watcher
- `docker-compose.yaml` - development docker-compose config

## Deployment

### Build image

To build locally, first increment the semantic version in `dev/local-build.sh` and then run that script.

Building for deployment is done via Github Actions. Once a branch is ready for deployment, do a release through Github. An action will be run that builds the Docker image and sends it to [Dockerhub](https://hub.docker.com/repository/docker/kbase/proto-ui). See [deployment.md](docs/deployment.md) for detailed instructions.

### Environment variables

These environment variables can be set:

- `URL_PREFIX` - path prefix for all links and asset urls (css, js, images) that get generated in the app. Used when behind an nginx proxy.
- `KBASE_ENDPOINT` - prefix to all KBase service endpoints - usually something like `https://kbase.us/services` for production.
- `KBASE_ROOT` - prefix to all UI asset URLs - `https://narrative.kbase.us` in production.
