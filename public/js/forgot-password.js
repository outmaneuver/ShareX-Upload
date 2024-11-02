document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('If an account exists with this email, you will receive a password reset link shortly.');
            window.location.href = '/login';
        } else {
            alert(data.message || 'An error occurred');
        }
    } catch (error) {
        alert('An error occurred while processing your request');
    }
}); 