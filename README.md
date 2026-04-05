# Physics & Math Visualization Platform

An interactive 3D visualization of fundamental physics systems and mathematical phenomena. Toggle between four different simulations, each demonstrating crucial concepts in classical mechanics, gravity, waves, and electromagnetism.

## Live Demo
[Coming soon - deploy to Vercel/GitHub Pages]

## Features

### 1. Black Hole Accretion Disk
**Physics:** Newtonian gravity, Keplerian orbital mechanics, frame-dragging simulation

**Math behind it:**
- Gravitational acceleration: `a = GM/r²`
- Orbital velocity: `v = √(GM/r)`
- Accretion disk flattening: tidal forces compress particles into thin disk
- Energy dissipation: particles spiral inward due to friction/drag

**What you're seeing:**
- 50,000 particles orbiting a singularity
- Temperature gradient: white-hot core → orange → red → deep space
- Particles absorbed past event horizon (r < 12 units)
- Real-time orbital mechanics simulation

**Tunable parameters:**
- `Gravity Strength (G_M)`: Controls how quickly particles spiral inward

---

### 2. N-Body Gravity Simulation
**Physics:** Newton's law of universal gravitation with pairwise forces

**Math behind it:**
- Gravitational force between two bodies: `F = G(m1·m2)/r²`
- Total force on body i: `F_i = Σ(j≠i) G(m_i·m_j)/r_ij²`
- Position update: `x(t+dt) = x(t) + v·dt`
- Velocity update: `v(t+dt) = v(t) + a·dt` (Euler integration)

**What you're seeing:**
- 100 randomly distributed bodies with random masses
- Chaotic multi-body interactions
- Gravitational "clumping" as bodies attract
- Boundary wrapping to keep system contained

**Tunable parameters:**
- `Gravitational Constant (G)`: Scales the strength of all gravitational interactions

**Physics concepts:**
- Chaos theory: sensitive to initial conditions
- Three-body problem: why orbital stability is complex
- Center of mass motion

---

### 3. Wave Interference
**Physics:** Superposition principle, constructive/destructive interference

**Math behind it:**
- Wave equation (1D): `y(x,t) = A·sin(k(x - ct))`
- Two sources: `y_total = A1·sin(k·d1 - ωt) + A2·sin(k·d2 - ωt)`
- Where `d1, d2` = distance from each source
- Wavelength: `λ = 2π/k`, frequency: `ω = 2πf`

**What you're seeing:**
- Two wave sources (top and bottom)
- Radial wavefronts propagating outward
- Constructive interference (bright): waves add in phase
- Destructive interference (dark): waves cancel out of phase
- Beautiful interference patterns (nodes and antinodes)

**Color mapping:**
- Red regions: high amplitude (constructive)
- Blue regions: low amplitude (destructive)
- Smooth gradients show the wave envelope

**Tunable parameters:**
- `Frequency`: Higher = more oscillations per unit distance
- `Amplitude`: Peak height of the wave

**Physics concepts:**
- Huygens' principle: every point on a wavefront is a source
- Phase difference determines constructive vs destructive interference
- Double-slit diffraction analogy

---

### 4. Charged Particle Dynamics
**Physics:** Coulomb's law, electrostatic repulsion/attraction

**Math behind it:**
- Coulomb force: `F = k·(q1·q2)/r²`
- Force direction: repulsive if same sign, attractive if opposite
- Electric field from charge Q: `E = kQ/r²`
- Work done by Coulomb force depends on path integral

**What you're seeing:**
- 500 randomly charged particles (red = positive, blue = negative)
- Two fixed charge sources (large red and blue spheres)
- Positive particles attracted to negative source, repelled by positive
- Negative particles exhibit opposite behavior
- Particles also repel/attract each other

**Coulomb constant (k):** Controls force strength

**Physics concepts:**
- Charge conservation
- Superposition of electric fields
- Energy considerations (potential energy ~1/r)
- Plasma behavior when many charges interact

---

## Technical Stack

- **Three.js r128**: 3D rendering
- **Vite**: Build tool & dev server
- **Vanilla JavaScript**: Physics engines written from scratch
- **GLSL-inspired shaders**: Color gradients, point rendering

## Installation & Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/physics-viz.git
cd physics-viz

# Install dependencies
npm install

# Start dev server (opens on http://localhost:3000)
npm run dev

# Build for production
npm run build
```

## Project Structure

```
physics-viz/
├── index.html          # Entry point
├── physics-viz.js      # Main platform + 4 simulation classes
├── style.css           # UI styling
├── package.json
├── vite.config.js
└── README.md
```

## How It Works

### Architecture

Each simulation is a class inheriting from a base pattern:
- `init()`: Set up geometry, particles, initial conditions
- `update(dt)`: Physics step (forces, integration, boundary conditions)
- `cleanup()`: Tear down and remove from scene
- `getControlsHTML()`: Dynamic UI for tunable parameters
- `attachControlListeners()`: Wire up slider/input events

The main `PhysicsViz` class orchestrates scene setup, camera, lights, and swapping between simulations.

### Physics Integration

All simulations use **Euler integration** (simple but fast):
```javascript
velocity += acceleration * dt
position += velocity * dt
```

For black hole: custom Keplerian orbital dynamics
For N-body: pairwise gravitational summation
For waves: analytical sine function superposition
For charged: Coulomb force summation

### Performance

- **50,000 particles** (black hole) at 60 FPS
- **10,000 particles** (waves) with smooth interference
- **500 bodies** (charged particles) with O(n²) force calculation
- Optimized with `BufferGeometry` and vertex color updates

---

## Portfolio Value

This project demonstrates:

1. **Physics Knowledge**
   - Understanding of fundamental forces (gravity, electromagnetism)
   - Numerical integration and differential equations
   - Multi-body simulation and chaos theory

2. **Mathematics**
   - Vector algebra (dot products, cross products)
   - Trigonometry and wave equations
   - Calculus (integration, acceleration from force)

3. **Graphics Programming**
   - 3D transformations and camera control
   - Particle systems and point clouds
   - Color mapping and visualization design

4. **Software Engineering**
   - Class-based architecture
   - State management (switching between simulations)
   - Real-time performance optimization

---

## Future Extensions

- [ ] Relativistic corrections (time dilation near black holes)
- [ ] Magnetic field visualization
- [ ] Planetary orbital mechanics (Kepler's laws)
- [ ] Fluid dynamics solver (Navier-Stokes)
- [ ] Quantum wavefunction visualization
- [ ] Save/load initial conditions
- [ ] Export physics data as CSV
- [ ] Mobile touch controls

---

## Learning Resources

- **Classical Mechanics**: Goldstein - "Classical Mechanics"
- **Gravity**: Carroll & Ostlie - "An Introduction to Modern Astrophysics"
- **Waves**: Griffiths - "Introduction to Electrodynamics"
- **Numerical Methods**: Numerical Recipes in C
- **Three.js**: https://threejs.org/docs

---

## License

MIT

---

## Author

Built as a portfolio project demonstrating physics simulation, real-time visualization, and interactive 3D graphics.

