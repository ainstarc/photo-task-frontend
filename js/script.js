async function compressImage(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scaleSize = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve({ compressedFile, compressedBlob: blob });
                    },
                    'image/jpeg',
                    quality
                );
            };
        };
    });
}

async function uploadWithRetry(formData, url, maxRetries = 2) {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            if (attempt > 0) {
                document.getElementById('results').textContent = `Retry attempt ${attempt}: Processing...`;
            } else {
                document.getElementById('results').textContent = "Processing...";
            }

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Server Error: ${response.statusText}`);
            }
        } catch (error) {
            if (attempt === maxRetries) {
                throw error; // throw after max retries
            }
            attempt++;
            console.log(`Retrying... attempt ${attempt}`);
            await new Promise(res => setTimeout(res, 1000)); // wait 1 sec before retry
        }
    }
}

document.getElementById('image-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    document.getElementById('results').textContent = "Preparing...";
    document.getElementById('original-size').textContent = "";
    document.getElementById('compressed-size').textContent = "";
    document.getElementById('preview').src = "";

    const formData = new FormData();
    const fileInput = document.getElementById('image-file');
    const photoInput = document.getElementById('take-photo');

    let selectedFile = fileInput.files[0] || photoInput.files[0];

    if (selectedFile) {
        document.getElementById('original-size').textContent = `Original Size: ${(selectedFile.size / 1024).toFixed(2)} KB`;

        const { compressedFile, compressedBlob } = await compressImage(selectedFile);

        document.getElementById('compressed-size').textContent = `Compressed Size: ${(compressedBlob.size / 1024).toFixed(2)} KB`;

        const previewURL = URL.createObjectURL(compressedBlob);
        document.getElementById('preview').src = previewURL;

        formData.append("file", compressedFile);
    } else {
        alert("Please select or take a photo.");
        return;
    }

    try {
        const data = await uploadWithRetry(formData, 'https://photo-task-backend.onrender.com/detect');
        document.getElementById('results').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('results').textContent = "Error after retries: " + error.message;
    }
});
