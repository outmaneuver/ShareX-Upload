// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/dashboard/statistics');
        const data = await response.json();
        
        document.getElementById('totalUploads').textContent = data.uploads;
        document.getElementById('storageUsed').textContent = formatBytes(data.storageUsed);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load uploads
async function loadUploads() {
    try {
        const response = await fetch('/dashboard/images');
        const data = await response.json();
        
        const uploadsContainer = document.getElementById('uploads');
        uploadsContainer.innerHTML = data.data.images
            .map(image => `
                <div class="upload-item">
                    <div class="upload-info">
                        <div class="upload-filename">${image.filename}</div>
                        <div class="upload-meta">
                            <small>${formatDate(image.createdAt)}</small>
                            <small>${formatBytes(image.size)}</small>
                        </div>
                    </div>
                    <div class="upload-actions">
                        <button onclick="copyToClipboard('${image.url}')" class="btn btn-secondary btn-sm">Copy URL</button>
                        <button onclick="deleteImage('${image._id}')" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading uploads:', error);
    }
}

// Delete image
async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        const response = await fetch(`/dashboard/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete image');
        
        showToast('Image deleted successfully');
        await loadUploads();
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Failed to delete image', 'error');
    }
}

// Copy URL to clipboard
async function copyToClipboard(imageId) {
    try {
        const url = `${window.location.origin}/i/${imageId}`;
        await navigator.clipboard.writeText(url);
        showToast('URL copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast('Failed to copy URL', 'error');
    }
}

// Format bytes to human readable size
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Handle settings form
async function saveSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const settings = {
        file_name_length: parseInt(formData.get('file_name_length')),
        upload_password: formData.get('upload_password'),
        hide_user_info: formData.get('hide_user_info') === 'on'
    };

    try {
        const response = await fetch('/dashboard/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            alert('Settings saved successfully');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
    }
}

// Generate ShareX config
function generateConfig() {
    window.location.href = '/dashboard/generate-config';
}

// Profile menu toggle
function initializeProfileMenu() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const initials = document.querySelector('.initials');
    
    // Set user initials
    const username = localStorage.getItem('username') || 'User';
    initials.textContent = username.charAt(0).toUpperCase();
    
    profileTrigger.addEventListener('click', () => {
        profileDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileTrigger.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
}

// Theme switcher
function initializeThemeSwitch() {
    const themeSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        themeSwitch.checked = currentTheme === 'dark-mode';
    }
    
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });
}

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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeProfileMenu();
    initializeThemeSwitch();
    loadStatistics();
    loadUploads();
    
    // Add settings form submit handler
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
});