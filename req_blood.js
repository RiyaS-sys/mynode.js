document.getElementById('request-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const bloodType = document.getElementById('blood-type').value;
    const units = document.getElementById('units').value;
    const hospitalName = document.getElementById('hospital').value;

    // Send data to the server
    fetch('http://localhost:3001/request-blood', { // Ensure this matches your server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            blood_type: bloodType,
            units: units,
            hospital_name: hospitalName
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('result').innerText = data; // Display success message
    })
    .catch(error => {
        console.error('Error:', error); // Log any errors
        document.getElementById('result').innerText = 'An error occurred: ' + error.message;
    });
});
