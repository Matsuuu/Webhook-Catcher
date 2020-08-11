# Webhook Handler

Webhook handler is a small javascript tool used for easy listening of webhook events.

Webhook handler can be run fully from the command line, and can be used to automate simple tasks with webhooks, for example
updating a web page of a project on a push to master.

### Usage

Webhook Handler can be used through [npx](https://nodejs.dev/learn/the-npx-nodejs-package-runner) for easy listening of webhooks.

A simple listener can be set up with a single command.

```bash
npx webhook-handler tasks.json
```

*A JSON file with instructions about the hook tasks is required to run the project*

#### Generating a tasks.json

You can generate a default tasks.json with `npx webhook-handler -g`. A default file looks like this:

```json
{
    "port": 8080,
    "verbose": true,
    "repositories": [
        {
            "repository": "https://github.com/my-user-name/my-repository",
            "name": "my-repository",
            "tasks": [
                {
                    "name": "Pull latest version",
                    "command": "git pull"
                }
            ]
        }
    ]
}
```

By setting the repository to your git repository, and writing your tasks you've set up your tasks.json


#### Configuring the listener

The tasks.json file functions as a full configuration file, and therefore has a few extra fields outside of
just the tasks:

***port*** sets the port to listen to in the device webhook handler runs on.

***verbose*** sets the logging behavior of the program.


#### Sample workflow

Setting up the catcher is made into as minimal as possible.

The workflow should be something along the lines of:

1. Generate a tasks.json
2. Populate the tasks.json file with your repository information
3. Assign tasks to be handled on webhook
4. (Optional) Set up a [reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) to forward the requests to the webhook handler port
5. Run Webhook handler
6. Add Webhook handler url to your git repository's webhooks
