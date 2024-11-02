// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/dashboard/statistics');
        if (!response.ok) throw new Error('Failed to fetch statistics');
        
        const data = await response.json();
        
        // Always show at least 0
        document.getElementById('totalUploads').textContent = data.uploads || '0';
        document.getElementById('storageUsed').textContent = formatBytes(data.storageUsed || 0);
        
        // Update the UI to show the statistics are loaded
        const statsContainer = document.getElementById('statistics');
        if (statsContainer) {
            statsContainer.classList.remove('loading');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Show error state but keep showing 0s
        document.getElementById('totalUploads').textContent = '0';
        document.getElementById('storageUsed').textContent = '0 Bytes';
        showToast('Failed to load statistics', 'error');
    }
}

// Load uploads with pagination
let currentPage = 1;
const PAGE_SIZE = 10;

// Add these variables at the top
let isLoading = false;
let hasMoreImages = true;

// Utility function to check if file exists
async function checkFileExists(filename) {
    try {
        const response = await fetch(`/uploads/${filename}`, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Copy URL to clipboard
async function copyToClipboard(filename) {
    try {
        // First check if file exists
        const fileExists = await checkFileExists(filename);
        if (!fileExists) {
            showToast('Image file not found on server', 'error');
            return;
        }

        const url = `${window.location.origin}/uploads/${filename}`;
        // Use modern clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                textArea.remove();
                throw new Error('Failed to copy URL');
            }
        }
        showToast('URL copied to clipboard', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast('Failed to copy URL', 'error');
    }
}

// View image with modal
async function viewImage(filename, mimetype) {
    try {
        // First check if file exists
        const fileExists = await checkFileExists(filename);
        if (!fileExists) {
            showToast('Image file not found on server', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="/uploads/${filename}" alt="${filename}" 
                    onerror="this.onerror=null; showToast('Failed to load image', 'error'); document.querySelector('.image-modal').remove();">
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal when clicking outside or on close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.className === 'close-modal') {
                modal.remove();
            }
        });

        // Add keyboard support for closing modal
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    } catch (error) {
        console.error('Error viewing image:', error);
        showToast('Failed to view image', 'error');
    }
}

// Delete image with confirmation and checks
async function deleteImage(imageId, filename) {
    try {
        const confirmed = await showConfirmDialog('Are you sure you want to delete this image?');
        if (!confirmed) return;

        const response = await fetch(`/dashboard/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for session cookies
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete image');
        }

        // Remove the image element from the DOM
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }

        showToast('Image deleted successfully', 'success');
        
        // Refresh the uploads list and statistics
        await loadUploads(1);
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast(error.message || 'Failed to delete image', 'error');
    }
}

// Load uploads with improved error handling
async function loadUploads(page = 1) {
    if (isLoading || !hasMoreImages) return;
    
    try {
        isLoading = true;
        const response = await fetch(`/dashboard/images?page=${page}&limit=${PAGE_SIZE}`);
        if (!response.ok) throw new Error('Failed to fetch uploads');
        
        const data = await response.json();
        const uploadsContainer = document.getElementById('uploads');
        
        if (page === 1) uploadsContainer.innerHTML = '';

        if (!data.data.images || data.data.images.length === 0) {
            hasMoreImages = false;
            if (page === 1) {
                uploadsContainer.innerHTML = '<div class="no-uploads">No uploads found</div>';
            }
            return;
        }

        for (const image of data.data.images) {
            const fileExists = await checkFileExists(image.filename);
            const uploadItem = document.createElement('div');
            uploadItem.className = 'upload-item';
            uploadItem.setAttribute('data-image-id', image._id);
            uploadItem.innerHTML = `
                <div class="upload-info">
                    <div class="upload-filename ${!fileExists ? 'missing-file' : ''}">
                        <i class="fas fa-file"></i> ${image.filename}
                        ${!fileExists ? '<span class="missing-badge">File Missing</span>' : ''}
                    </div>
                    <div class="upload-meta">
                        <span><i class="far fa-clock"></i> ${formatDate(image.createdAt)}</span>
                        <span><i class="fas fa-weight"></i> ${formatBytes(image.size)}</span>
                    </div>
                </div>
                <div class="upload-actions">
                    ${fileExists ? `
                        <button onclick="copyToClipboard('${image.filename}')" class="btn btn-secondary btn-sm" title="Copy URL">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="viewImage('${image.filename}', '${image.mimetype}')" class="btn btn-secondary btn-sm" title="View Image">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteImage('${image._id}', '${image.filename}')" class="btn btn-danger btn-sm" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            uploadsContainer.appendChild(uploadItem);
        }

        hasMoreImages = data.data.hasMore;
    } catch (error) {
        console.error('Error loading uploads:', error);
        showToast('Failed to load uploads', 'error');
    } finally {
        isLoading = false;
    }
}

// Load more uploads
function loadMore() {
    currentPage++;
    loadUploads(currentPage);
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
    const statsContainer = document.getElementById('statistics');
    if (statsContainer) {
        statsContainer.classList.add('loading');
    }
    loadStatistics();
    loadUploads(1);
    initializeThemeSwitch();
    
    // Add debounced scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                if (!isLoading && hasMoreImages) {
                    currentPage++;
                    loadUploads(currentPage);
                }
            }
        }, 100);
    });
});

// Add this function to handle logout
async function logout(e) {
    e.preventDefault();
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = data.redirect || '/auth/login';
        } else {
            showToast('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error during logout', 'error');
    }
}

// Add this function for toast notifications if not already present
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

// Add this function
async function generateConfig() {
    try {
        const response = await fetch('/dashboard/generate-config');
        if (!response.ok) throw new Error('Failed to generate config');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sharex-config.sxcu';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        showToast('Config file generated successfully');
    } catch (error) {
        console.error('Error generating config:', error);
        showToast('Failed to generate config file', 'error');
    }
}