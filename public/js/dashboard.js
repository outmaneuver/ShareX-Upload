// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/dashboard/statistics');
        if (!response.ok) throw new Error('Failed to fetch statistics');
        const data = await response.json();
        
        document.getElementById('totalUploads').textContent = data.uploads || '0';
        document.getElementById('storageUsed').textContent = formatBytes(data.storageUsed || 0);
    } catch (error) {
        console.error('Error loading statistics:', error);
        showToast('Failed to load statistics', 'error');
    }
}

// Load uploads with pagination
let currentPage = 1;
const PAGE_SIZE = 10;

async function loadUploads(page = 1) {
    try {
        const response = await fetch(`/dashboard/images?page=${page}&limit=${PAGE_SIZE}`);
        if (!response.ok) throw new Error('Failed to fetch uploads');
        const data = await response.json();
        
        const uploadsContainer = document.getElementById('uploads');
        if (page === 1) uploadsContainer.innerHTML = '';

        data.data.images.forEach(image => {
            const uploadItem = document.createElement('div');
            uploadItem.className = 'upload-item';
            uploadItem.innerHTML = `
                <div class="upload-info">
                    <div class="upload-filename">
                        <i class="fas fa-file"></i> ${image.filename}
                    </div>
                    <div class="upload-meta">
                        <span><i class="far fa-clock"></i> ${formatDate(image.createdAt)}</span>
                        <span><i class="fas fa-weight"></i> ${formatBytes(image.size)}</span>
                    </div>
                </div>
                <div class="upload-actions">
                    <button onclick="copyToClipboard('${image._id}')" class="btn btn-secondary btn-sm">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="deleteImage('${image._id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            uploadsContainer.appendChild(uploadItem);
        });

        // Update load more button visibility
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = data.data.hasMore ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        showToast('Failed to load uploads', 'error');
    }
}

// Load more uploads
function loadMore() {
    currentPage++;
    loadUploads(currentPage);
}

// Delete image with confirmation
async function deleteImage(imageId) {
    try {
        const confirmed = await showConfirmDialog('Are you sure you want to delete this image?');
        if (!confirmed) return;
        
        const response = await fetch(`/dashboard/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete image');
        
        showToast('Image deleted successfully');
        currentPage = 1;
        await loadUploads(1);
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Failed to delete image', 'error');
    }
}

// Confirmation dialog
function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="confirm-content">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.confirm-dialog').remove(); resolve(false);">Cancel</button>
                    <button class="btn btn-danger" onclick="this.closest('.confirm-dialog').remove(); resolve(true);">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    });
}

// Copy URL to clipboard with feedback
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

// Format date with relative time
function formatDate(date) {
    const now = new Date();
    const uploadDate = new Date(date);
    const diff = now - uploadDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff/86400000)}d ago`;
    
    return uploadDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Theme switcher with smooth transition
function initializeThemeSwitch() {
    const themeSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light-mode';
    
    document.body.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === 'dark-mode';
    
    themeSwitch.addEventListener('change', (e) => {
        document.body.classList.add('theme-transition');
        if (e.target.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode');
        }
        setTimeout(() => document.body.classList.remove('theme-transition'), 300);
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitch();
    loadStatistics();
    loadUploads(1);
    
    // Add infinite scroll
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            loadMore();
        }
    });
});