// Dynamically set the base URL and update the "Back to Home" link
document.addEventListener("DOMContentLoaded", () => {
  const currentUrl = window.location.href; // Get the full URL of the current page
  const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/") + 1); // Extract the base URL

  // Update the "Back to Home" link if it exists
  const backToHomeLink = document.getElementById("back-to-home");
  if (backToHomeLink) {
    backToHomeLink.href = baseUrl + "../index.html"; // Set the dynamic link
  }
});
