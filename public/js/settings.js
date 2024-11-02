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
            document.getElementById('userEmail').textContent = data.email || 'Not set';
            document.getElementById('username').textContent = data.username || 'Not set';
            
            // Set form values
            document.getElementById('file_name_length').value = data.file_name_length || 10;
            document.getElementById('upload_password').value = data.upload_password || '';
            document.getElementById('hide_user_info').checked = data.hide_user_info || false;
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
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
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
    document.getElementById('uploadSettingsForm').addEventListener('submit', saveSettings);
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