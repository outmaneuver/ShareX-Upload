// Validation functions
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && 
           hasNumbers && hasSpecialChar;
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

// Real-time validation feedback
document.getElementById('username').addEventListener('input', function() {
    const username = this.value;
    const feedback = document.getElementById('username-feedback');
    const input = this;
    
    if (!username) {
        feedback.textContent = 'Username is required';
        feedback.className = 'feedback-error';
        input.className = '';
    } else if (!isValidUsername(username)) {
        feedback.textContent = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores';
        feedback.className = 'feedback-error';
        input.className = 'input-error';
    } else {
        feedback.textContent = '';
        feedback.className = '';
        input.className = 'input-success';
    }
});

document.getElementById('email').addEventListener('input', function() {
    const email = this.value;
    const feedback = document.getElementById('email-feedback');
    const input = this;
    
    if (!email) {
        feedback.textContent = 'Email is required';
        feedback.className = 'feedback-error';
        input.className = '';
    } else if (!isValidEmail(email)) {
        feedback.textContent = 'Please enter a valid email address';
        feedback.className = 'feedback-error';
        input.className = 'input-error';
    } else {
        feedback.textContent = '';
        feedback.className = '';
        input.className = 'input-success';
    }
});

document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const feedback = document.getElementById('password-feedback');
    const input = this;
    
    if (!password) {
        feedback.textContent = 'Password is required';
        feedback.className = 'feedback-error';
        input.className = '';
    } else if (!isStrongPassword(password)) {
        feedback.textContent = 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters';
        feedback.className = 'feedback-error';
        input.className = 'input-error';
    } else {
        feedback.textContent = '';
        feedback.className = '';
        input.className = 'input-success';
    }
});

document.getElementById('confirmPassword').addEventListener('input', function() {
    const confirmPassword = this.value;
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('confirmPassword-feedback');
    const input = this;
    
    if (!confirmPassword) {
        feedback.textContent = 'Please confirm your password';
        feedback.className = 'feedback-error';
        input.className = '';
    } else if (confirmPassword !== password) {
        feedback.textContent = 'Passwords do not match';
        feedback.className = 'feedback-error';
        input.className = 'input-error';
    } else {
        feedback.textContent = '';
        feedback.className = '';
        input.className = 'input-success';
    }
});

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    document.querySelectorAll('.feedback-error').forEach(el => {
        el.textContent = '';
    });

    // Validate all fields
    let hasErrors = false;
    
    if (!isValidUsername(username)) {
        document.getElementById('username-feedback').textContent = 'Invalid username format';
        document.getElementById('username-feedback').className = 'feedback-error';
        hasErrors = true;
    }
    
    if (!isValidEmail(email)) {
        document.getElementById('email-feedback').textContent = 'Invalid email format';
        document.getElementById('email-feedback').className = 'feedback-error';
        hasErrors = true;
    }
    
    if (!isStrongPassword(password)) {
        document.getElementById('password-feedback').textContent = 'Password does not meet requirements';
        document.getElementById('password-feedback').className = 'feedback-error';
        hasErrors = true;
    }
    
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword-feedback').textContent = 'Passwords do not match';
        document.getElementById('confirmPassword-feedback').className = 'feedback-error';
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registration successful', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Error during registration', 'error');
    }
}

// Add event listener to form
document.getElementById('registerForm').addEventListener('submit', register); 