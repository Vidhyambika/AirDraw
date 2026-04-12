# AirDraw Application

An interactive web application enabling users to draw on their screen using hand gestures via a webcam, powered by **React**, **Google MediaPipe**, and **HTML5 Canvas**.

https://github.com/user-attachments/assets/d89e5163-1995-486c-b00c-c98c0535eb8c


https://github.com/user-attachments/assets/ebec22c2-4582-4792-a553-1967fef05b3c

## Prerequisites

Before getting started, make sure you have [Node.js](https://nodejs.org/) installed on your computer.

## How to Run Locally

You must run the commands inside the `airdraw` project directory. If you are currently in your main user folder, be sure to "change directories" (`cd`) first!

**Step 1. Navigate to the project directory:**
```bash
cd airdraw
```

**Step 2. Install Dependencies:**
All dependencies to run the app natively have already been installed recently, but if it's a fresh clone or you need to re-install, run:
```bash
npm install
```

**Step 3. Start the Development Server:**
```bash
npm run dev
```

**Step 4. Open in Browser:**
Once the server starts up, it will output a local address (usually `http://localhost:5173`). 
Open that link in Google Chrome, Microsoft Edge, or Firefox.

> **Note:** The browser will immediately ask for **Camera Permissions**. You must accept the prompt to allow the app to view your hands!

## Gesture Controls

When the camera spins up, your screen will show "Loading" while the backend quickly sets up Google's WASM engine. Once the status says **Ready**, the app will begin recognizing hands:

*   👌 **Pinch to Draw**: Touch your index finger and thumb together to begin a curve.
*   ✌️ **Detach to Erase**: Make a "peace" sign (index and middle fingers extended) and wipe over existing lines to erase them.
*   ✋ **Palm to Hover**: Keep your hand fully open to hover the cursor around the screen without drawing anything.
*   ✊ **Fist to Pause**: Clench your hand into a fist to temporarily hide the cursor completely and stop tracking.

## Features

- **High-Performance Execution**: DOM updates are completely avoided during the 60fps tracking loop! The logic hooks natively onto an HTML5 Canvas node, ensuring no frame drops.
- **Micro-Smooth Curves**: Hand movements are mathematically smoothed out utilizing quadratic Bezier Curve interpolations between frame ticks.
- **Save / UI**: Offers complete Dark & Light mode support, brush controls, an undo/redo stack, and a one-click download feature!
