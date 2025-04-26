const form = document.getElementById('image-form');
const fileInput = document.getElementById('image-file');
const photoInput = document.getElementById('take-photo');
const resultsDiv = document.getElementById('results');
const spinner = document.getElementById('spinner');
const message = document.getElementById('message');

let selectedFile = null;

// Save file locally when selected
fileInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    previewImage(selectedFile);
});

photoInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    previewImage(selectedFile);
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!selectedFile) {
        alert('Please select or take a photo first.');
        return;
    }

    // Show loading spinner
    spinner.style.display = 'block';
    message.textContent = 'Uploading and processing...';
    resultsDiv.textContent = '';

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('https://photo-task-backend.onrender.com/detect', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                displayResults(data);
                message.textContent = 'Detection complete!';
                spinner.style.display = 'none';
                return;
            } else {
                throw new Error('Detection failed');
            }
        } catch (error) {
            attempts++;
            if (attempts < maxAttempts) {
                message.textContent = `Retry attempt ${attempts}: Processing...`;
                await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s
            } else {
                message.textContent = 'Detection failed after multiple attempts.';
                spinner.style.display = 'none';
                return;
            }
        }
    }
});

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById('preview');
        preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayResults(data) {
    resultsDiv.textContent = JSON.stringify(data, null, 2);
}
