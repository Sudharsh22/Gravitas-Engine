# Gravitas Engine

An interactive, high-fidelity 3D visualization platform for fundamental physics systems and mathematical phenomena. Gravitas features a highly accurate **Velocity Verlet** numerical integration engine, real-time post-processing (Bloom), and a retro-arcade pixel aesthetic.

## Features

### 1. Black Hole Accretion Disk
**Physics:** Paczynski-Wiita pseudo-Newtonian potential, Keplerian orbital mechanics, frame-dragging simulation.

**Math behind it:**
- Pseudo-Newtonian Gravitational acceleration: `a = GM / (r - r_s)²`
- Orbital velocity: `v = √(GM/r)`
- Accretion disk flattening: tidal forces compress particles into a thin disk.
- Energy dissipation: particles spiral inward due to friction/drag.

**What you're seeing:**
- 50,000 particles orbiting a singularity with a pronounced photon sphere glow.
- Temperature Gradient (Bloom): Particles glow blue/white-hot near the event horizon and redshift to orange/deep red further out.
- Real-time orbital mechanics simulating matter consumption.

---

### 2. N-Body Gravity Simulation
**Physics:** Newton's law of universal gravitation with pairwise forces and soft-core potentials.

**Math behind it:**
- Gravitational force between two bodies: `F = G(m1·m2)/(r² + ε²)` (with a softening parameter `ε` to prevent singularities).
- Integration: **Velocity Verlet** (highly stable for orbital paths compared to basic Euler).
  ```javascript
  p(t+dt) = p(t) + v(t)dt + 0.5 * a(t) * dt²
  v(t+dt) = v(t) + 0.5 * (a(t) + a(t+dt)) * dt
  ```

**What you're seeing:**
- 150 mass points interacting via mutual gravity.
- Beautiful, highly-stable chaotic multi-body interactions that form orbital clusters.

---

### 3. Wave Mechanics
**Physics:** Superposition principle, constructive/destructive interference.

**Math behind it:**
- Radial wavefronts from two point sources.
- Two wave sources: `y_total = A1·sin(k·d1 - ωt) + A2·sin(k·d2 - ωt)`

**What you're seeing:**
- Over 16,000 distinct points forming a continuous wave mesh.
- Interference Patterns: Dynamic color blending (Cyan peaks, Purple troughs) indicating constructive and destructive interference respectively.

---

### 4. Electrodynamics
**Physics:** Coulomb's law, electrostatic repulsion/attraction, surrogate Lorentz forces.

**Math behind it:**
- Coulomb force: `F = k·(q1·q2)/(r² + ε²)`
- Integration: **Velocity Verlet** to cleanly preserve energies over long simulations.

**What you're seeing:**
- Hundreds of randomly charged particles (Purple = positive, Cyan = negative) interacting dynamically.
- Static dipole sources drawing opposing charges while deflecting their own.

---

## Technical Stack
- **Three.js (^0.128.0)**: Core WebGL 3D rendering.
- **EffectComposer**: High-fidelity post-processing rendering pipeline (UnrealBloomPass).
- **Vite & ES Modules**: Ultra-fast build tool, providing hot module reloading.
- **Vanilla JavaScript**: Zero physics-engine packages used. Math and arrays written from scratch.

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/Sudharsh22/Gravitas-Engine.git
cd Gravitas-Engine
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```
*(The server will start on http://localhost:5174/ or similar)*

4. Build for deployment:
```bash
npm run build
```

## Project Structure (Modularized)

The engine is heavily decoupled into individual simulation classes for ultimate readability.

```
Gravitas-Engine/
├── index.html                   # Entry point (Loads Pixel fonts)
├── physics-viz.js               # Main orchestrator & EffectComposer pipeline
├── style.css                    # Glassmorphic, retro UI styling
├── package.json                 # Dependency management
├── vite.config.js               # Optional vite configurations
└── simulations/                 # Extracted simulation modules
    ├── blackhole.js
    ├── nbody.js
    ├── waves.js
    └── electrodynamics.js
```

## Aesthetic Design
The user interface features a robust **glassmorphic** dark mode panel, overlaid on top of the raw 3D space. It is designed using pixel-art styling (`Press Start 2P` and `VT323` fonts), offering an arcade feel juxtaposed against advanced fluid and orbital mathematics. 

## License
MIT
