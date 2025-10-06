<img width="1030" height="120" alt="Screenshot 2025-10-06 at 9 29 57 AM" src="https://github.com/user-attachments/assets/a9c248ea-ed41-47d0-bdb0-59cad120e440" />

# cosmic_partical_symphony
Cosmic_Particle_Symphony” is a mesmerizing fusion of science and art, where swirling particles dance in harmony like a celestial orchestra. It captures the hidden rhythms of the universe, blending energy, motion, and light into a cosmic performance that evokes wonder and infinite possibilities.
# 3D Milky Way Galaxy Explorer

Lightweight browser-based 3D visualization of a Milky Way-like galaxy using Three.js. The project renders a starfield, nebulae, and planets with a HUD for navigation, object info, and simple system stats.

## Files
- `galaxy.html` — Main HTML file. Links `galaxy.css`, Three.js (CDN), and `galaxy.js`.

- `galaxy.css` — Styles for HUD, loader, cursor and tooltip.
- `galaxy.js` — Main application script that builds the scene, handles input, and runs the animation loop.
- `README.md` — This file.

## Prerequisites
- Modern browser (Chromium, Firefox, Safari).
- Node/npm or Python available for serving files locally (recommended; avoid loading via `file://`).

## Quick start (macOS)
1. Open a terminal in the project folder:
   - In VS Code: View → Terminal or use the integrated terminal.
2. Start a simple static server (one of the options below):

   - Python 3:
     ```
     python3 -m http.server 8000
     ```
   - Node (http-server):
     ```
     npm install -g http-server
     http-server -p 8000
     ```

3. Open `http://localhost:8000/galaxy.html` in your browser.

> Note: Opening `galaxy.html` directly via `file://` can cause CORS/asset loading issues. Use a local HTTP server.

## Controls & UI
- Auto Rotate — toggle automatic galaxy rotation.
- Show Planets / Show Nebulae — toggle visibility of those groups.
- Deep Scan — performs a simulated scan and updates the HUD with deeper object info.
- Hover over objects to see the tooltip. Click and drag to rotate view, scroll to zoom.

## Development notes
- Three.js is included via CDN in `galaxy.html`:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
