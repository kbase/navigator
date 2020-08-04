# Deploying this dashboard app in KBase.
This document describes how to build and deploy a new version of this module in the KBase environment.

## 1. Set up a deployment image.
This module uses Github Actions to build and save a Docker image in Dockerhub. This building gets triggered by releasing a new version through the releases page of the repo. Just draft a new release with a unique version, and that'll trigger the action.

Once the image is built, it's sent to the `kbase/proto-ui` repo in Dockerhub: https://hub.docker.com/repository/docker/kbase/proto-ui.

## 2. Deploy through Rancher.
In your environment of choice, open the Rancher view, and find the right service. This is currently (8/4/2020):
* On narrative-dev - `dashboard-redesign`
* On CI - in the `search2` stack, `react-ui`

Either way, upgrade (the little circled up-arrow on the right side) this to use the newly tagged image. Save and finalize the upgrade, and away it goes. 

# Setting up a new stack.
This takes a little extra work than the above.

1. Create a new stack in whatever Rancher environment. Name it whatever makes sense.
2. Set the following environment variables:
* `URL_PREFIX` - this is the prefix for any path that the "service" (the server that comes along with this module) generates. I.e., it's the path that to the entrypoint. On narrative-dev, it's `/dashboard-redesign`, so the URL of the main page is `https://narrative-dev.kbase.us/dashboard-redesign`
* `KBASE_ROOT` - this is the root URL for the environment. `https://ci.kbase.us`, `https://narrative-dev.kbase.us`, etc. This is used to craft most external link URLs.
* `KBASE_ENDPOINT` - this is the root endpoint for all services. `https://kbase.us/services` for production, `https://ci.kbase.us/services` for CI, etc. This is used to call individual data providers.
3. Everything else should be default.
4. Update the environment nginx to route to the path you just created. It will need a block like this:
```
location ~ /(dashboard-redesign)/(.*) {
    set $servicehost $1;
    set $serviceurl $2;
    proxy_pass http://$servicehost:5000/$serviceurl;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
That needs to get checked in to the secure nginx config location and the nginx image restarted, so this requires help from people who can do that.  

5. Once nginx restarts, and the new stack is available, the new route should be available as well. You can then easily redeploy any changes through Rancher as above.
