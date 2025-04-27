import { compressImage } from "./global.js";

const form = document.getElementById("image-form");
const fileInput = document.getElementById("image-file");
const photoInput = document.getElementById("take-photo");
const resultsDiv = document.getElementById("results");
const spinner = document.getElementById("spinner");
const message = document.getElementById("message");

let selectedFile = null;

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

// Display results in a formatted way
function displayResults(data) {
  resultsDiv.innerHTML = "";

  data.detections.forEach((detection) => {
    const detectionElement = document.createElement("div");
    detectionElement.classList.add("detection-result");
    detectionElement.innerHTML = `
      <strong>Object:</strong> ${detection.object}<br>
      <strong>Count:</strong> ${detection.count}<br>
      <strong>Average Confidence:</strong> ${detection.average_confidence}<br>
      <hr>
    `;
    resultsDiv.appendChild(detectionElement);
  });
}

// Handle file input changes
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);
});

photoInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
  previewImage(selectedFile);
});

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedFile) {
    alert("Please select or take a photo first.");
    return;
  }

  try {
    selectedFile = await compressImage(selectedFile, 800, 800, 0.7);
  } catch (error) {
    alert("Image compression failed. Please try again.");
    return;
  }

  document.getElementById("compressed-size").textContent = `Compressed size: ${(
    selectedFile.size / 1024
  ).toFixed(2)} KB`;

  spinner.style.display = "block";
  message.textContent = "Uploading and processing...";
  resultsDiv.textContent = "";

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/detect", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      displayResults(data);
      message.textContent = "Detection complete!";
    } else {
      throw new Error("Detection failed");
    }
  } catch (error) {
    message.textContent = "Error: " + error.message;
  } finally {
    spinner.style.display = "none";
  }
});
