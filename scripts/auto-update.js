const { exec } = require('child_process');
const path = require('path');

// Change interval to 1 minute (60000 ms)
const UPDATE_INTERVAL = 60000;

async function checkForUpdates() {
    try {
        const projectDir = path.resolve(__dirname, '..');
        console.log(`[${new Date().toISOString()}] Checking for updates...`);
        
        const commands = [
            'git fetch origin',
            'git status -uno',
            'git pull'
        ];

        for (const cmd of commands) {
            await new Promise((resolve, reject) => {
                exec(cmd, { cwd: projectDir }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error}`);
                        reject(error);
                        return;
                    }
                    if (stdout.trim()) {
                        console.log(`${stdout}`);
                    }
                    resolve();
                });
            });
        }
    } catch (error) {
        console.error('Update check failed:', error);
    }
}

// Run initial check
checkForUpdates();

// Set up interval (every minute)
setInterval(checkForUpdates, UPDATE_INTERVAL);