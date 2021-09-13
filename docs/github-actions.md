# Github Actions

Certain events in the Navigator GitHub reopo trigger a GitHub Action (GHA) workflow which runs tests, builds an image, and push the image to GitHub Container Registry (GHCR). A single GHA workflow located in `.github/workflows/test-and-build.yml` is invoked for all actions. This workflow will run unit tests, and, should they succeed, build an image and push it up to the GitHub Container Registry (GHCR).

The docker reference for all built images is

```bash
ghcr.io/kbase/navigator:TAG
```

where `TAG` is one of the tags described in this document.

For instance, to pull down the `main`-tagged Navigator image from GHCR

```bash
docker pull ghcr.io/kbase/navigator:main
```

The following events trigger the GHA:

- pushing commits to the `main` branch
- creating or pushing commits to a feature branch `feature-*`
- creating or pushing commits to a fix branch `fix-*`
- creating or pushing commits to a pull request
- creating a release

## Main branch `main`

The workflow will be run when a commit is pushed to the `main` branch. The primary use case for this is when a pull request is merged into `main`. The purpose of this workflow is to provide an image which represents the latests fully vetted state of the codebase. This is the image which should typically be deployed in `CI` and `narrative-dev`.

The tag for the resulting image is `:main`, e.g. `ghcr.io/kbase/navigator:main`.

## Feature branch `feature-*`

The workflow will be run when a commit is pushed to a "feature" branch.

A feature branch will be used when working on any new functionality for the Navigator. At any point in time a feature branch will represent an intermediate state of the desired set of changes, although at some point it will be "nearly complete." A feature branch will eventually result in a pull request, which will embody the effort to finalize the changes.

A feature branch should be named `feature-FEATURE_NAME`, where `FEATURE_NAME` may be a description of the feature or a reference to a ticket tracking the new feature.

For example:

- `feature-add-narrative-list-scrolling`
- `feature-PTV-1234-add-spelling-correction`
- `feature-PTV-6789`

Upon pushing to a feature branch, the workflow will be triggered, which will, upon success, result in an image tagged with `:feature-FEATURE_NAME`.

For instance, the feature branch which introduces this very document, and the workflow described herein, is `feature-improve-gha-workflow`.

Feature branchs builds are useful for demonstrating new features before they are finalized, and may be deployed in `ci`, `narrative-dev` or other shared development deployment environments.

## Fix branch `fix-*`

Similar to feature branchs, fix branches are rather dedicated to fixing one or more issues which probably originate in a Jira ticket.

The fix branch name has the form `fix-FIX_NAME`, where `FIX_NAME` is probably a Jira ticket id, like `PTV-1234`.

A fix branch may similarly be deployed to `ci`, `narrative-dev`, or other deployment environments in order to share the in-progress or finalized solution to an issue.

## Pull request `#-merge`

Although we don't typically deploy a Pull Request, we certainly might. A Pull Request (PR) should usually represent the "nearly final" state of a feature or fix branch, which will be iterated over until the repo's maintenance team, represented by a reviewer, approves it. As such, it is a requirement that the codebase pass all tests and an image can be successfully built. The image may or may not be deployed as a part of that review.

Any pull request activity, but typically PR creation and updating, will trigger the workflow.

The unusual name for the tag is simply due to the general-purpose `CI_REF_NAME_SLUG` environment variable created by the `FranzDiebold/github-env-vars-action@v2` GHA, recommended by GitHub. This GHA creates a set of environment variables (which are printed to the log when the Navigator GHA runs), including `CI_REF_NAME_SLUG`. The `SLUG` indicates that the git ref name is converted to a universally acceptable form.

## Release `v#-#-#`

A release created through the GitHub release tool will trigger the workflow and create an image with a tag like `v#-#-#`. This tag is very similar to the git tag created during a release, which is based on a semantic version, and looks like `v#.#.#`.

Since the tag is based on `CI_REF_NAME_SLUG`, the "slugification" process converts the `.` to `-` in order to make it more universally acceptable as an identifier.

A release image is based on the state of the `main` branch at some point at which the team decides a new release is suitable. A release image is suitable for deployment in any user-facing environment, including `appdev` and `prod` (aka `narrative.kbase.us`). It may also be deployed to `next`, which serves as a pre-production evalutation environment.
