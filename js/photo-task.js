import { compressImage } from "./global.js";

const form = document.getElementById("image-form");
const fileInput = document.getElementById("image-file");
const photoInput = document.getElementById("take-photo");
const resultsDiv = document.getElementById("results");
const spinner = document.getElementById("spinner");
const message = document.getElementById("message");

let selectedFile = null;
let elapsedInterval = null;

// Preview image
function previewImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("preview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// Start elapsed time
function startElapsedTime() {
  let elapsedTime = 0;
  document.getElementById("elapsed-time").textContent = elapsedTime;
  elapsedInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById("elapsed-time").textContent = elapsedTime;
  }, 1000);
}

// Stop elapsed time
function stopElapsedTime() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
}

// Display results in a formatted way
function displayResults(data) {
  const resultsHeading = document.getElementById("detection-results-heading");

  // Clear any existing results
  resultsDiv.innerHTML = "";

  // Check if there are any detections
  if (data.detections && data.detections.length > 0) {
    // Show the heading
    resultsHeading.style.display = "block";

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
  } else {
    // If no detections, hide the heading and show a better message
    resultsHeading.style.display = "none";
    resultsDiv.innerHTML = `
      <p>
        No objects were detected in the uploaded image. Please try uploading a clearer or more relevant image for better results.
      </p>
    `;
  }
}

// Handle file input changes
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);

  // Reset UI state for a new image
  stopElapsedTime();
  resultsDiv.innerHTML = "";
  message.textContent = "";
  spinner.style.display = "none";
});

photoInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);

  // Reset UI state for a new image
  stopElapsedTime();
  resultsDiv.innerHTML = "";
  message.textContent = "";
  spinner.style.display = "none";
});

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedFile) {
    alert("Please select or take a photo first.");
    return;
  }

  try {
    // Reset UI state for a new detection
    stopElapsedTime();
    resultsDiv.innerHTML = "";
    message.textContent = "Uploading and processing...";
    spinner.style.display = "block";

    // Compress the image
    selectedFile = await compressImage(selectedFile, 800, 800, 0.7);
    document.getElementById(
      "compressed-size"
    ).textContent = `Compressed size: ${(selectedFile.size / 1024).toFixed(
      2
    )} KB`;

    // Start the timer
    startElapsedTime();

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Detection logic with retries
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          "https://photo-task-backend.onrender.com/detect",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          displayResults(data);
          message.textContent = "Detection complete!";
          stopElapsedTime(); // Stop the timer
          spinner.style.display = "none";
          return; // Exit the loop and function after success
        } else {
          throw new Error("Detection failed");
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          message.textContent = `Server not ready (Attempt ${attempts}/${maxAttempts}). Retrying in 5 seconds...`;
          await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait 5 seconds before retrying
        } else {
          message.textContent =
            "Failed after multiple retries. Please try again later.";
          stopElapsedTime(); // Stop the timer
          spinner.style.display = "none";
          return; // Exit the function after retries are exhausted
        }
      }
    }
  } catch (error) {
    message.textContent = "Error: " + error.message;
  } finally {
    // Ensure the spinner is hidden and timer is stopped in case of any error
    stopElapsedTime();
    spinner.style.display = "none";
  }
});
