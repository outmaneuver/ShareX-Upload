// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/settings/user');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const { status, data } = await response.json();
        
        if (status === 'success' && data) {
            // Display user info
            const userEmailElement = document.getElementById('userEmail');
            const usernameElement = document.getElementById('username');
            const fileNameLengthElement = document.getElementById('file_name_length');
            const uploadPasswordElement = document.getElementById('upload_password');
            const hideUserInfoElement = document.getElementById('hide_user_info');

            if (userEmailElement) userEmailElement.textContent = data.email || 'Not set';
            if (usernameElement) usernameElement.textContent = data.username || 'Not set';
            if (fileNameLengthElement) fileNameLengthElement.value = data.file_name_length || 10;
            if (uploadPasswordElement) uploadPasswordElement.value = data.upload_password || '';
            if (hideUserInfoElement) hideUserInfoElement.checked = data.hide_user_info || false;
        } else {
            throw new Error('Invalid response data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data', 'error');
    }
}

// Generate random upload password
function generateUploadPassword() {
    const length = 32;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    document.getElementById('upload_password').value = password;
}

// Handle settings form submission
async function saveSettings(e) {
    e.preventDefault();
    
    const data = {
        file_name_length: parseInt(document.getElementById('file_name_length').value),
        upload_password: document.getElementById('upload_password').value,
        hide_user_info: document.getElementById('hide_user_info').checked
    };
    
    try {
        const response = await fetch('/settings/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Settings updated successfully', 'success');
        } else {
            throw new Error(result.message || 'Failed to update settings');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        showToast(error.message || 'Error updating settings', 'error');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    document.getElementById('generatePasswordBtn').addEventListener('click', generateUploadPassword);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
});

// Add toast notification function if not present
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
} 