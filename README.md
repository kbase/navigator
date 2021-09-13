# KBase Narratives Navigator

[![Testing Status](https://github.com/kbase/navigator/workflows/Tests/badge.svg)](https://github.com/kbase/navigator/workflows/Tests/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/kbase/navigator/badge.svg?branch=main)](https://coveralls.io/github/kbase/navigator?branch=main)

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

- `Dockerfile` - Navigator app image
- `dev/Dockerfile-python` - development python image
- `docker-compose.yaml` - development docker-compose config

## Deployment

### Build image

Building for deployment is done via a GitHub Action workflow. The source for this is located in `./github/workflows/test-and-build.yml`.

This workflow will run unit tests, build an image, and push it to the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

The workflow will run for any push to `main`, a feature (`feature-*`) or fix (`fix-*`) branch, activity on a pull request, and a release.

See [deployment.md](docs/deployment.md) for detailed instructions.

### Environment variables

These environment variables can be set:

- `URL_PREFIX` - a url path prefix (initial component of the url path) for all links and asset urls (css, js, images) pointing back to the app itself.

  It is available to the app at runtime as `Runtime.config().url_prefix`. In local development (on localhost) it should be the empty string (or omitted); for a deployment it should be `narratives`. (Vaguer language may still be be found in the codebase because early on the specific prefix had not been arrived at.)

  It **must** be used in constructing all urls back to itself.

  The reason for its existence is that when developing against localhost, it does not operate behind a proxy and the app runs simply at the root. By default this url is `http://localhost:5000`. However, in a shared deployment environment, it needs to exist on a path dedicated to it so that the front end proxy can route to it. For example, in CI, the url to it is `https://ci.kbase.us/narratives`, and it coexists with other apps like the narrative at `https://ci.kbase.us/narrative`, kbase-ui at `https//ci.kbase.us`, the workspace at `https://ci.kbase.us/services/ws`, etc.

- `KBASE_ENDPOINT` - the url origin (protocol, host, port) and path prefix for KBase service endpoints; e.g. `https://ci.kbase.us/services` for CI, `https://kbase.us/services` for production, etc.

  It is available to the app at runtime as `Runtime.config().service_root`. Note carefully the name from "kbase_endpoint" to "service"root" in the runtime config.

  Generally one should never need to use `service_root` to construct URLs. Rather, it is used within the configuration module (`config.ts`) to build all required service urls under the key `service_routes`, accessed like `Runtime.config().service_routes.SERVICE`, where `SERVICE` is the key for a specific service. For example, `Runtime.getConfig().service_routes.workspace` contains the current url for the Workspace service. You'll need to look in `config.json` for the supported service keys.

- `KBASE_ROOT` - the url origin (protocol, host, port) for all link or asset URLs which target another KBase user interface, such as the Narrative, kbase-ui, or ui-assets.

  It is available to the app at runtime as `Runtime.config().kbase_root`. It is should be used for constructing all urls for links or resources to other KBase user interfaces. For example, to the user profile for a given user, the landing page for an object, a narrative, etc.

  > NOTE: It is currently unused in the codebase; rather they just use absolute path urls without the origin, which causes the browser to assume the current origin. KBase user interface urls do work in deployments since the other user interfaces will be operating on the same origin, but they do not work in local development.
