// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/settings/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const { data } = await response.json();
        
        document.getElementById('email').value = data.email || '';
        document.getElementById('username').value = data.username || '';
        document.getElementById('file_name_length').value = data.file_name_length || 10;
        document.getElementById('hide_user_info').checked = data.hide_user_info || false;
        
        // Set initials in profile circle
        const initials = document.querySelector('.initials');
        if (initials && data.username) {
            initials.textContent = data.username.charAt(0).toUpperCase();
        }

        // Initialize theme
        initializeThemeSwitch();
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data', 'error');
    }
}

// Theme switcher with smooth transition
function initializeThemeSwitch() {
    const themeSwitch = document.getElementById('checkbox');
    if (!themeSwitch) return;

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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Handle settings form submission
    const settingsForm = document.getElementById('uploadSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                file_name_length: parseInt(document.getElementById('file_name_length').value),
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
        });
    }
}); 