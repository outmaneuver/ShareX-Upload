// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/dashboard/statistics');
        if (!response.ok) throw new Error('Failed to fetch statistics');
        
        const data = await response.json();
        
        // Update active uploads count
        document.getElementById('totalUploads').textContent = data.uploads || '0';
        document.getElementById('storageUsed').textContent = formatBytes(data.storageUsed || 0);
        
        // Update deleted uploads if element exists
        const deletedUploadsEl = document.getElementById('deletedUploads');
        if (deletedUploadsEl) {
            deletedUploadsEl.textContent = data.deletedUploads || '0';
        }
        
        // Update total uploads if element exists
        const totalUploadsEl = document.getElementById('totalUploadsAll');
        if (totalUploadsEl) {
            totalUploadsEl.textContent = data.totalUploads || '0';
        }
        
        const statsContainer = document.getElementById('statistics');
        if (statsContainer) {
            statsContainer.classList.remove('loading');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        document.getElementById('totalUploads').textContent = '0';
        document.getElementById('storageUsed').textContent = '0 Bytes';
        showToast('Failed to load statistics', 'error');
    }
}

// Load uploads with pagination
const PAGE_SIZE = 5;
let currentPage = 1;
let isLoading = false;
let hasMoreImages = true;
let showDeletedFiles = false; // New flag for deleted files

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
            credentials: 'include'
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
        
        // Get the current number of images in the container
        const remainingImages = document.querySelectorAll('.upload-item').length;

        // If this was the last image on the current page, go back one page
        // unless we're on page 1
        if (remainingImages === 0 && currentPage > 1) {
            currentPage--;
        }
        
        // Reload the current page of images
        await loadUploads(currentPage, true);
        await loadStatistics();
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast(error.message || 'Failed to delete image', 'error');
    }
}

// Load uploads with improved error handling
async function loadUploads(page = 1, reset = false) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        const response = await fetch(`/dashboard/images?page=${page}&limit=${PAGE_SIZE}&showDeleted=${showDeletedFiles}`);
        if (!response.ok) throw new Error('Failed to fetch uploads');
        
        const data = await response.json();
        const uploadsContainer = document.getElementById('uploads');
        
        if (reset) {
            uploadsContainer.innerHTML = '';
        }

        if (!data.data.images || data.data.images.length === 0) {
            hasMoreImages = false;
            if (page === 1) {
                uploadsContainer.innerHTML = '<div class="no-uploads">No uploads found</div>';
            }
            addPaginationControls();
            return;
        }

        for (const image of data.data.images) {
            const uploadItem = document.createElement('div');
            uploadItem.className = `upload-item ${image.deleted || image.missing ? 'deleted-file' : ''}`;
            uploadItem.setAttribute('data-image-id', image._id);
            uploadItem.innerHTML = `
                <div class="upload-info">
                    <div class="upload-filename">
                        <i class="fas fa-file"></i> ${image.filename}
                        ${image.missing ? '<span class="missing-badge">File Missing</span>' : ''}
                        ${image.deleted ? '<span class="deleted-badge">Deleted</span>' : ''}
                    </div>
                    <div class="upload-meta">
                        <span><i class="far fa-clock"></i> ${formatDate(image.createdAt)}</span>
                        <span><i class="fas fa-weight"></i> ${formatBytes(image.size)}</span>
                    </div>
                </div>
                <div class="upload-actions">
                    ${!image.missing && !image.deleted ? `
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
        addPaginationControls();

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
    return new Promise((resolve, reject) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="confirm-content">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.confirm-dialog').remove(); window.dialogResolve(false);">Cancel</button>
                    <button class="btn btn-danger" onclick="this.closest('.confirm-dialog').remove(); window.dialogResolve(true);">Delete</button>
                </div>
            </div>
        `;
        
        // Store resolve function globally (temporary)
        window.dialogResolve = resolve;
        
        document.body.appendChild(dialog);
        
        // Add click outside to cancel
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
                window.dialogResolve(false);
            }
        });
        
        // Add escape key to cancel
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                window.dialogResolve(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
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
    const uploadsContainer = document.getElementById('uploads');
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'upload-controls';
    toggleContainer.innerHTML = `
        <button id="toggleDeletedBtn" class="btn btn-secondary" onclick="toggleDeletedFiles()">
            <i class="fas fa-eye"></i> Show Deleted Files
        </button>
    `;
    uploadsContainer.parentNode.insertBefore(toggleContainer, uploadsContainer);
    
    loadUploads(1, true);
    loadStatistics();
    initializeThemeSwitch();
});

// Update the logout function
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
            window.location.href = '/login';
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

// Add pagination UI to the dashboard
function addPaginationControls() {
    // Remove existing pagination if it exists
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationContainer.innerHTML = `
        <button id="prevPage" class="btn btn-secondary" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span class="page-info">Page ${currentPage}</span>
        <button id="nextPage" class="btn btn-secondary" ${!hasMoreImages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    const uploadsContainer = document.getElementById('uploads');
    uploadsContainer.parentNode.insertBefore(paginationContainer, uploadsContainer.nextSibling);
    
    // Add event listeners
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadUploads(currentPage, true);
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', () => {
        if (hasMoreImages) {
            currentPage++;
            loadUploads(currentPage, true);
        }
    });
}

// Add toggle for deleted files
function toggleDeletedFiles() {
    showDeletedFiles = !showDeletedFiles;
    currentPage = 1;
    loadUploads(1, true);
    updateToggleButton();
}

// Add update toggle button function
function updateToggleButton() {
    const toggleBtn = document.getElementById('toggleDeletedBtn');
    if (toggleBtn) {
        toggleBtn.innerHTML = showDeletedFiles ? 
            '<i class="fas fa-eye-slash"></i> Hide Deleted Files' : 
            '<i class="fas fa-eye"></i> Show Deleted Files';
        toggleBtn.classList.toggle('active', showDeletedFiles);
    }
}