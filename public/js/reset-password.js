function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && 
           hasNumbers && hasSpecialChar;
}

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

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    showToast('Invalid password reset link', 'error');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1500);
}

// Real-time validation feedback
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const feedback = document.getElementById('password-feedback');
    const input = this;
    
    if (!password) {
        feedback.textContent = 'Password is required';
        feedback.className = 'feedback-error';
        input.className = '';
    } else if (!isStrongPassword(password)) {
        feedback.textContent = 'Password must meet all requirements';
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

document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    document.querySelectorAll('.feedback-error').forEach(el => {
        el.textContent = '';
    });

    // Validate passwords
    let hasErrors = false;
    
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
        const response = await fetch('/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Password reset successful', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            throw new Error(data.message || 'Password reset failed');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showToast(error.message || 'Error resetting password', 'error');
    }
}); 