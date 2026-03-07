const form = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox");

// show an error message in the UI
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

// hide any existing error
function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // send login request to backend
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    // backend returned an error
    if (!res.ok) {
      showError(data.message || "Login failed.");
      return;
    }

    // success (in a real app you'd probably save the token and redirect)
    alert("Logged in!");
  } catch (err) {
    console.error(err);
    showError("Could not reach the login server.");
  }
});