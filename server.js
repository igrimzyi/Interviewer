const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// lets us read JSON sent from the login form
app.use(express.json());

// serve files from the /login folder at the /login URL
// so /login/script.js maps to ./login/script.js
app.use("/login", express.static(path.join(__dirname, "login")));

// main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// login route (same page)
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  // make sure both fields exist
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // just a test login for now
  if (email === "test@example.com" && password === "password123") {
    return res.status(200).json({
      message: "Login successful",
      token: "demo-token-123"
    });
  }

  return res.status(401).json({ message: "Invalid email or password." });
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});