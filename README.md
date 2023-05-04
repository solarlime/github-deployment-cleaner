[![CI](https://github.com/solarlime/github-deployment-cleaner/actions/workflows/main.yml/badge.svg)](https://github.com/solarlime/github-deployment-cleaner/actions/workflows/main.yml)
# GitHub Deployment Cleaner

This is a service that helps to clean all deployments in a repository.

## Why?

GitHub has many features to do with repositories. However, some of them are not available graphically. For example, cleaning deployments. It's not very convenient to make cURL requests. At least for me.

## How?
This app is just a GUI for the GitHub API. To clean a repo from deployments, you need to provide a username, a repo name, and your [personal token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). No user information is collected; you can check it.

Try it [here](https://solarlime.github.io/github-deployment-cleaner/)!
