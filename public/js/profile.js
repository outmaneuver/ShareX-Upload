// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/dashboard/profile/info');
        if (!response.ok) throw new Error('Failed to fetch user info');
        
        const data = await response.json();
        
        document.getElementById('email').value = data.email;
        document.getElementById('username').value = data.username;
    } catch (error) {
        console.error('Error loading user info:', error);
        showToast('Failed to load user information', 'error');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadUserInfo); 