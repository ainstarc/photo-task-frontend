const form = document.getElementById("image-form");
const fileInput = document.getElementById("image-file");
const photoInput = document.getElementById("take-photo");
const resultsDiv = document.getElementById("results");
const spinner = document.getElementById("spinner");
const message = document.getElementById("message");

let selectedFile = null;

// Save file locally when selected
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);
});

photoInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedFile) {
    alert("Please select or take a photo first.");
    return;
  }

  // Show original size
  document.getElementById("original-size").textContent = `Original size: ${(
    selectedFile.size / 1024
  ).toFixed(2)} KB`;

  // Compress the image
  try {
    selectedFile = await compressImage(selectedFile, 800, 800, 0.7);
  } catch (error) {
    alert("Image compression failed. Please try again.");
    return;
  }
  document.getElementById("compressed-size").textContent = `Compressed size: ${(
    selectedFile.size / 1024
  ).toFixed(2)} KB`;

  // Show loading spinner
  startElapsedTime(); // Start the timer
  spinner.style.display = "block";
  message.textContent = "Uploading and processing...";
  resultsDiv.textContent = "";

  let attempts = 0;
  const maxAttempts = 5;
  const retryDelay = 5000; // 5 seconds

  // Log file details for debugging
  console.log(
    `Uploading file: ${selectedFile.name} - size: ${selectedFile.size} bytes`
  );

  while (attempts < maxAttempts) {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Uncomment the line below for production
      // let url = "http://127.0.0.1:8000/detect"; // Localhost URL for testing
      let url = "https://photo-task-backend.onrender.com/detect"; // Production URL
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        stopElapsedTime(); // Stop the timer when the result is out
        const data = await response.json();
        displayResults(data);
        message.textContent = "Detection complete!";
        spinner.style.display = "none";
        return;
      } else {
        throw new Error("Detection failed");
      }
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        message.textContent = `Server not ready (Attempt ${attempts}/${maxAttempts}). Retrying in 5 seconds...`;
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait 5s
      } else {
        stopElapsedTime(); // Stop the timer if retries are exhausted
        message.textContent =
          "Failed after multiple retries. Please try again later.";
        spinner.style.display = "none";
        return;
      }
    }
  }
});

// Preview image
function previewImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("preview");
    preview.src = e.target.result;
    preview.style.display = "block"; // Ensure the preview is displayed
  };
  reader.readAsDataURL(file);
}

// Display results in a formatted way
function displayResults(data) {
  // Clear any existing results
  resultsDiv.innerHTML = "";

  // Iterate over each object detection result
  data.detections.forEach(function (detection) {
    const detectionElement = document.createElement("div");
    detectionElement.classList.add("detection-result");

    // Display each detection as a key-value pair (object, count, average_confidence)
    detectionElement.innerHTML = `
            <strong>Object:</strong> ${detection.object}<br>
            <strong>Count:</strong> ${detection.count}<br>
            <strong>Average Confidence:</strong> ${detection.average_confidence}<br>
            <hr>
        `;

    // Append the formatted result to the results container
    resultsDiv.appendChild(detectionElement);
  });
}

// Compress image to a smaller size
export function compressImage(
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Update elapsed time
let startTime = null;
let elapsedInterval = null;

export function startElapsedTime() {
  startTime = new Date();
  elapsedInterval = setInterval(updateElapsedTime, 1000);
}

export function stopElapsedTime() {
  clearInterval(elapsedInterval);
  elapsedInterval = null;
  startTime = null;
}

function updateElapsedTime() {
  if (startTime !== null) {
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    document.getElementById("elapsed-time").textContent = `${elapsedSeconds}`;
  }
}
