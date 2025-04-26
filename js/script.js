document.getElementById('image-form').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent form submission

    const formData = new FormData();
    const fileInput = document.getElementById('image-file');
    const photoInput = document.getElementById('take-photo');
    
    // Image preview element
    const imagePreview = document.getElementById('image-preview');
    
    // Show loading spinner
    imagePreview.style.display = "none";
    const results = document.getElementById('results');
    results.textContent = "Loading...";

    // If a file was uploaded
    if (fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);

        // Display image preview
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(fileInput.files[0]);
    } 
    // If a photo was taken
    else if (photoInput.files[0]) {
        formData.append("file", photoInput.files[0]);

        // Display image preview
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(photoInput.files[0]);
    }

    // Send image to backend for detection
    try {
        const response = await fetch('https://photo-task-backend.onrender.com/detect', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            results.textContent = JSON.stringify(data, null, 2);
        } else {
            results.textContent = `Error: ${response.statusText}`;
        }
    } catch (error) {
        results.textContent = `Error: ${error.message}`;
    }
});
