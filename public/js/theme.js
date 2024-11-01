// Theme management
function initializeThemeSwitch() {
    const themeSwitch = document.getElementById('checkbox');
    if (!themeSwitch) return;

    // Get theme from localStorage or default to light-mode
    const currentTheme = localStorage.getItem('theme') || 'light-mode';
    
    // Apply theme to body
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(currentTheme);
    
    // Set switch state
    themeSwitch.checked = currentTheme === 'dark-mode';
    
    // Add change listener
    themeSwitch.addEventListener('change', (e) => {
        document.body.classList.add('theme-transition');
        const newTheme = e.target.checked ? 'dark-mode' : 'light-mode';
        const oldTheme = e.target.checked ? 'light-mode' : 'dark-mode';
        
        document.body.classList.remove(oldTheme);
        document.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        
        setTimeout(() => document.body.classList.remove('theme-transition'), 300);
    });
}

// Apply theme immediately when page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    document.body.classList.add(savedTheme);
    initializeThemeSwitch();
}); 