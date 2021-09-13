# Deployment

## Deploying this dashboard app in KBase

This document describes how to build and deploy a new version of this module in the KBase environment.

### 1. Set up a deployment image

This module uses Github Actions to build and save a Docker image in GitHub Image Registry (GHCR). The build is triggered by releasing a new version through the releases page of the repo. Just draft a new release with a semantic version tag, like `v1.2.3`, and that'll trigger the action.

Once the image is built, it's sent pushed to GHCR as `kbase/navigator`. You can inspect the Packages to find the built images and their tags. The tag for a release image should be in the form `v1.2.3` - that is, a semantic version prefixed with the letter "v".

> Images are also built for other repo events, including

### 2. Deploy through Rancher

In your environment of choice, open the Rancher view, and find the `dashboard-redesign` service.

To deploy the image, you need to "upgrade" the service.

(the little circled up-arrow on the right side) this to use the newly tagged image. Save and finalize the upgrade, and away it goes.

## Setting up a new stack

This takes a little extra work than the above.

1. Create a new stack in whatever Rancher environment. Name `navigator` unless there is some reason not to.

2. Set the following environment variables:

   Required:

   - `KBASE_ROOT` - the root origin URL for the user interfaces. It will be `https://narrative.kbase.us` for prod, `https://ci.kbase.us` for CI, etc. This is used as the origin for the `href` of internal links.
   - `KBASE_ENDPOINT` - the base url, or "origin", for all service calls. It will be `https://kbase.us/services` for production, `https://ci.kbase.us/services` for CI, etc.

   Optional:

   - `URL_PREFIX` - this is the prefix for any path that the "service" (the server that comes along with this module) responds to; defaults to `narratives`. For example, in a narrative-dev deployment, with the `URL PREFIX` either omitted, or set to `narratives`, the plain URL to the Navigator's main page is `https://narrative-dev.kbase.us/narratives`. There should be little to no need to override this in a deployment; it will be overridden by default in development.

3. Everything else should be default.

4. Update the deployment's nginx proxy to route to the path you just created. It will need a block like this:

   ```nginx
   location ~ /(narratives)/(.*) {
       set $servicehost $1;
       set $serviceurl $2;
       proxy_pass http://$servicehost:5000/$serviceurl;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header Host $http_host;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

   Note that in the line `location ~ /(narratives)/(.*) {`, the string literal `narratives` must match the value of `URL_PREFIX`; by default it does, but if you specify a different `URL_PREFIX`, take care to also update the location line.

   That needs to get checked in to the secure nginx config location and the nginx image restarted, so this requires help from people who can do that.

5. Once nginx restarts, and the new stack is available, the new route should be available as well. You can then easily redeploy any changes through Rancher as above.
