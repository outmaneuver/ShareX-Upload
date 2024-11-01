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
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadUploads(); // Refresh the uploads list
            loadStatistics(); // Refresh statistics
        } else {
            throw new Error('Failed to delete image');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image');
    }
}

// Copy URL to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('URL copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy URL');
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadUploads();
    
    // Add settings form submit handler
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
});