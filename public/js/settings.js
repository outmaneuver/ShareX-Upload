// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/dashboard/user-data');
        const data = await response.json();
        
        document.getElementById('userEmail').value = data.email;
        document.getElementById('username').value = data.username;
        document.getElementById('file_name_length').value = data.file_name_length;
        document.getElementById('hide_user_info').checked = data.hide_user_info;
        
        // Set initials in profile circle
        const initials = document.querySelector('.initials');
        initials.textContent = data.username.charAt(0).toUpperCase();
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data', 'error');
    }
}

// Handle password change
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/dashboard/change-password', {
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
});

// Handle upload settings
document.getElementById('uploadSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        file_name_length: parseInt(formData.get('file_name_length')),
        hide_user_info: formData.get('hide_user_info') === 'on'
    };
    
    try {
        const response = await fetch('/dashboard/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('Settings updated successfully');
        } else {
            showToast('Error updating settings', 'error');
        }
    } catch (error) {
        showToast('Error updating settings', 'error');
    }
});

// Toast notification system
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
}); 