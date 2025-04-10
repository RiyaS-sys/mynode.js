document.addEventListener('DOMContentLoaded', function () {
    function loadDonorData() {
        fetch('http://localhost:3001/donors')
            .then(response => response.json())
            .then(data => {
                const donorDiv = document.getElementById('donor-data');
                donorDiv.innerHTML = '';
                data.forEach(donor => {
                    const donorItem = document.createElement('p');
                    donorItem.textContent = `Donor: ${donor.name}, Blood Type: ${donor.blood_type}, Contact: ${donor.contact}`;
                    donorDiv.appendChild(donorItem);
                });
            })
            .catch(error => console.error('Error loading donor data:', error));
    }

    function loadBloodRequests() {
        fetch('http://localhost:3001/blood-requests')
            .then(response => response.json())
            .then(data => {
                const requestDiv = document.getElementById('request-data');
                requestDiv.innerHTML = '';
                data.forEach(request => {
                    const requestItem = document.createElement('p');
                    requestItem.textContent = `Hospital: ${request.hospital_name}, Blood Type: ${request.blood_type}, Units: ${request.units}`;
                    requestDiv.appendChild(requestItem);
                });
            })
            .catch(error => console.error('Error loading blood requests:', error));
    }

    loadDonorData();
    loadBloodRequests();
});
