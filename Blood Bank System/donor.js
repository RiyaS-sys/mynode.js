document.getElementById('donorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = {
        donor_name: document.getElementById('name').value,
        blood_type: document.getElementById('blood-type').value,
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        contact: document.getElementById('contact').value,
        city: document.getElementById('city').value
    };

    // Send data to the server
    fetch('http://localhost:3001/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit donor registration form.');
        }
        return response.text(); // Read the response as text
    })
    .then(data => {
        // Show success message
        document.getElementById('responseMessage').innerText = data;
    })
    .catch(error => {
        // Show error message
        document.getElementById('responseMessage').innerText = error.message;
    });
});
