const { createServer } = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const args = process.argv.slice(2);

const generateConfig = () => {
    fs.writeFile(
        'tasks.json',
        JSON.stringify(
            {
                port: 8080,
                verbose: true,
                repositories: [{ repository: '', name: '', tasks: [{ name: '', command: '' }] }],
            },
            null,
            4
        ),
        (err) => {
            if (err) console.error(err);
        }
    );
    console.log('Generated config to tasks.json');
};

if (args.length < 1 || args[0] === '-h' || args[0] === '--help') {
    console.log(
        `\nTo use Webhook Catcher, provide a json file with tasks.\n\nTo generate one, run this comand with the '-g' flag\n`
    );
    return;
}

if (args[0] === '-g') {
    return generateConfig();
}

// Parse task params and set default settings
const tasksFilePath = args[0].substring(0, 1) === '/' ? args[0] : './' + args[0];
const config = require(tasksFilePath);
const PORT = config.port;
const server = createServer();
let data = '';

const handleRequestData = (request) => {
    request.on('data', (chunk) => {
        data += chunk;
    });
};

const return400 = (response) => {
    response.statusCode = 400;
    response.end('Unsupported method');
};

const return404 = (response) => {
    response.statusCode = 403;
    response.end('Not found');
};

const return500 = (response) => {
    response.statusCode = 500;
    response.end('Server error');
};

const executeTasks = (repository) => {
    repository.tasks.forEach((task) => {
        exec(task.command, (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            if (stderr) {
                throw stderr;
            }
            if (config.verbose) {
                console.log(
                    `[${repository.name || repository.repository} => ${task.name || task.command}}]: ${stdout}`
                );
            }
        });
    });
};

const handleRequestTasks = (parsedData, response) => {
    const repositoryUrl = parsedData.repository.html_url;

    const repository = config.repositories.find((t) => t.repository === repositoryUrl);
    if (!repository) {
        return return404(response);
    }
    try {
        executeTasks(repository);
    } catch (err) {
        console.error(err);
        return false;
    }
    return true;
};

const checkRequest = (request, response) => {
    if (request.method !== 'POST') {
        return return400(response);
    }
    return true;
};

const validateRequest = () => {
    try {
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        return null;
    }
};

const handleRequestEnd = (request, response) => {
    request.on('end', () => {
        const parsedData = validateRequest();
        if (!parsedData) {
            return return500(response);
        }
        const success = handleRequestTasks(parsedData, response);
        if (!success) {
            return return500(response);
        }

        console.log('');
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ success: true }));
    });
};

server.on('request', (request, response) => {
    data = '';
    const isValid = checkRequest(request, response);
    if (!isValid) return;

    handleRequestData(request);
    handleRequestEnd(request, response);
});

server.listen(PORT, () => {
    console.log(`Starting server at port ${PORT}`);
});
