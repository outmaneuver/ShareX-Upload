// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/settings/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const { data } = await response.json();
        
        // Display user info
        document.getElementById('userEmail').textContent = data.email || 'Not set';
        document.getElementById('username').textContent = data.username || 'Not set';
        
        // Set form values
        document.getElementById('file_name_length').value = data.file_name_length || 10;
        document.getElementById('upload_password').value = data.upload_password || '';
        document.getElementById('hide_user_info').checked = data.hide_user_info || false;
        
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
        
        if (response.ok) {
            showToast('Settings updated successfully');
        } else {
            throw new Error('Failed to update settings');
        }
    } catch (error) {
        showToast('Error updating settings', 'error');
    }
}

// Handle password change
async function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/settings/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Password updated successfully');
            e.target.reset();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error updating password', 'error');
    }
}

// Toast notification
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Add form submit handlers
    document.getElementById('uploadSettingsForm').addEventListener('submit', saveSettings);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
}); 