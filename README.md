# Connect 4 Web Game

* **[Rommel Bayaborda]** - *[Role, e.g., Frontend Logic]*
* **[Piolo Constante]** - *[Role, e.g., UI/UX Design]*
* **[Aivan Rivero]** - *[Role, e.g., AI Algorithm]*
* **[Carlo Creus]** - *[Role, e.g., AI Algorithm]*
* **[Aerionne Wayne Araza]** - *[Role, e.g., Quality Assurance]*

## 📖 Description

This project is a browser-based recreation of Connect 4. The goal is simple: be the first to connect four of your colored discs in a row (horizontally, vertically, or diagonally). The game features a polished dark-mode interface with "glass-like" board effects where pieces realistically fall behind the board slots.

It was designed to run natively in any modern web browser without the need for external libraries or frameworks.

## ✨ Features

* **Game Modes:**
    * **PvP (Local):** Play against a friend on the same device.
    * **PvE (Player vs CPU):** Play against an AI opponent.
* **Intelligent AI:**
    * **Easy:** Makes random legal moves.
    * **Medium:** Blocks winning moves and attempts to capture the center.
    * **Hard:** Uses the **Minimax Algorithm** to predict future moves and play optimally.
* **Visuals & UX:**
    * **Realistic Animations:** Discs fall smoothly using calculated physics animations and sit visually *behind* the board mask.
    * **Neon Glow Effects:** Winning lines and active player turns are highlighted with neon glow effects.
    * **Hover Indicators:** "Ghost" pieces show exactly where your disc will land.
* **Game State Management:**
    * Real-time score tracking.
    * Turn indicators.
    * Win/Draw detection.
    * Instant Rematch functionality.

## 📸 Screenshots

### Start Screen
![Start Screen Placeholder](https://github.com/Waynearaza/IT-105-Final-Project/blob/5e947cff730349ef791b7fb6d9d9eb868127e9f8/Home%20Page.png)
### Gameplay (Dark Mode UI)
![Gameplay Placeholder](https://github.com/Waynearaza/IT-105-Final-Project/blob/5e947cff730349ef791b7fb6d9d9eb868127e9f8/PlayState.png)
## 🚀 Run Instructions

Since this project uses vanilla HTML/CSS/JS, no complex build steps or package managers (like npm) are required.

### Method 1: Direct Open (Simplest)
1.  Download or Clone the repository to your local machine.
2.  Navigate to the project folder.
3.  Double-click the `index.html` file.
4.  The game will open in your default web browser.

### Method 2: VS Code Live Server (Recommended)
If you are using Visual Studio Code:
1.  Install the **"Live Server"** extension.
2.  Right-click `index.html` in the file explorer.
3.  Select **"Open with Live Server"**.
4.  This simulates a real local server and automatically reloads if you make code changes.

### Method 3: Deployment (GitHub Pages)
To share the game with others:
1.  Push the code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Select the `main` branch as the source.
4.  GitHub will provide a live URL for your game.

---
*Created for [IT-105/Final Project] - [2025]*
