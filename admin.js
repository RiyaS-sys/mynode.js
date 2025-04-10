document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3001/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Redirect to inventory.html if login is successful
            window.location.href = '/inventory.html';
        } else {
            const data = await response.json();
            document.getElementById('error-message').innerText = data.error; // Show error message
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').innerText = 'An unexpected error occurred.';
    }
});
