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
                        <div>${image.filename}</div>
                        <small>${formatDate(image.createdAt)}</small>
                    </div>
                    <button onclick="deleteImage('${image._id}')" class="btn btn-danger">Delete</button>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading uploads:', error);
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
    return new Date(date).toLocaleDateString();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadUploads();
    
    // Handle settings form
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/dashboard/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                alert('Settings updated successfully');
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            alert('Error updating settings: ' + error.message);
        }
    });
});