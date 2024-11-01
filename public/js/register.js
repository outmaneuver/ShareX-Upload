document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('An error occurred during registration');
    }
}); 