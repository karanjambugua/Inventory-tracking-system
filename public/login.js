// Function to handle the login process
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Basic validation
    if (!username || !password) {
        document.getElementById("error-message").textContent = "Both fields are required.";
        return;
    }

    // Send credentials to server using POST
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        // Always return JSON so we can parse even for errors
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Login success: redirect to dashboard or homepage
            window.location.href = "home.html";  // Change this as needed
        } else {
            // Show error message from server
            document.getElementById("error-message").textContent = data.message || "Login failed.";
        }
    })
    .catch(error => {
        console.error("Error logging in:", error);
        document.getElementById("error-message").textContent = "There was an error. Please try again later.";
    });
}
