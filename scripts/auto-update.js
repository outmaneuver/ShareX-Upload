const { exec } = require('child_process');
const path = require('path');

const UPDATE_INTERVAL = 60000; // 1 minute

async function checkForUpdates() {
    try {
        const projectDir = path.resolve(__dirname, '..');
        console.log(`[${new Date().toISOString()}] Checking for updates...`);
        
        // First backup .env file
        await execCommand('cp .env .env.backup || true', projectDir);
        
        // Force remove untracked files and directories
        await execCommand('git clean -fd', projectDir);
        
        // Reset any local changes
        await execCommand('git reset --hard HEAD', projectDir);
        
        // Fetch latest changes
        await execCommand('git fetch origin main', projectDir);
        
        // Force pull latest changes
        await execCommand('git pull origin main --force', projectDir);
        
        // Restore .env file
        await execCommand('cp .env.backup .env || true', projectDir);
        
        // Install any new dependencies
        await execCommand('bun install', projectDir);
        
        console.log('Update completed successfully');
        
    } catch (error) {
        console.error('Update check failed:', error);
    }
}

function execCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            if (stdout.trim()) {
                console.log(`${stdout}`);
            }
            resolve(stdout);
        });
    });
}

// Run initial check
checkForUpdates();

// Set up interval
setInterval(checkForUpdates, UPDATE_INTERVAL);