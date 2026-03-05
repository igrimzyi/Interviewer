# 📦 Node.js Installation Guide (Windows & macOS)

This guide explains how to install Node.js on Windows and macOS and verify that it works correctly.

---

# 🪟 Windows Installation Guide

## 1️⃣ Download Node.js

1. Go to the official website:
   👉 https://nodejs.org
2. Download the **LTS (Long Term Support)** version for Windows.

## 2️⃣ Install Node.js

1. Open the downloaded `.msi` file.
2. Click **Next**.
3. Accept the License Agreement.
4. Keep default settings (recommended).
5. Click **Install**.
6. Finish the installation.

---

## 3️⃣ Verify Installation (Windows)

Open **Command Prompt** (Press `Win + R`, type `cmd`, press Enter)

Run:

```bash
node -v
npm -v
```

If successful, you will see version numbers like:

```bash
v20.x.x
10.x.x
```

✅ Node.js is installed successfully.

---

# 🍎 macOS Installation Guide

## Option 1 — Official Installer (Recommended)

### 1️⃣ Download

1. Visit:
   👉 https://nodejs.org
2. Download the **LTS version** for macOS.

### 2️⃣ Install

1. Open the downloaded `.pkg` file.
2. Follow the installation steps.
3. Complete the setup.

---

### 3️⃣ Verify Installation (macOS)

Open **Terminal** (Press `Cmd + Space`, type `Terminal`, press Enter)

Run:

```bash
node -v
npm -v
```

If installed correctly, you will see version numbers.

---

# 🍺 macOS Alternative: Install with Homebrew

If you use Homebrew, run:

```bash
brew update
brew install node
```

Verify:

```bash
node -v
npm -v
```

---

# 🧪 Test Node.js (Both Windows & macOS)

Run:

```bash
echo console.log("Node.js is working!") > test.js
node test.js
```

Expected output:

```bash
Node.js is working!
```

✅ Setup Complete!

---

# 🔄 Update Node.js

### Windows
Download the latest LTS version from:
https://nodejs.org  
Run the installer again.

### macOS (Homebrew)
```bash
brew upgrade node
```

---

# 📚 Useful Commands

| Command | Description |
|----------|------------|
| `node -v` | Check Node version |
| `npm -v` | Check npm version |
| `npm init` | Create package.json |
| `npm install <package>` | Install a package |

---

# ❓ Troubleshooting

- Restart Terminal / Command Prompt after installation.
- Make sure Node is added to PATH.
- Reinstall if `node` is not recognized.

---

🎉 You are ready to build with Node.js!