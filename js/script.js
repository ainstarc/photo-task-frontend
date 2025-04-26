document.getElementById('image-form').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent form submission

    const formData = new FormData();
    const fileInput = document.getElementById('image-file');
    const photoInput = document.getElementById('take-photo');
    
    // Check if a file was uploaded through the "Upload Image" option
    if (fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
    }

    // Check if a photo was taken through the "Take Photo" option
    else if (photoInput.files[0]) {
        formData.append("file", photoInput.files[0]);  // Attach the taken photo to the form data
    }

    // Make sure we have a file to upload
    if (formData.has('file')) {
        // Send image to FastAPI backend
        const response = await fetch('https://photo-task-backend.onrender.com/detect', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        } else {
            alert("Error: " + response.statusText);
        }
    } else {
        alert("Please select or take a photo to upload.");
    }
});
