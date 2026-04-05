# Quick Start Guide



# Copy the files from outputs into this directory
# (index.html, physics-viz.js, style.css, package.json, vite.config.js, README.md)
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `three@r128` - 3D graphics library
- `vite` - Development server

## Step 3: Run Locally

```bash
npm run dev
```

This opens http://localhost:3000 automatically with hot module reloading.

## Step 4: Explore the Simulations

**Black Hole** (default on load)
- Watch 50K particles spiral into a black hole
- Slider to adjust gravity strength
- See white-hot core → orange → red temperature gradient

**N-Body Gravity**
- 100 celestial bodies orbiting each other
- Adjust gravitational constant
- Witness chaotic multi-body dynamics

**Wave Interference**
- Two wave sources creating interference patterns
- Frequency slider: adjust wavelength
- Amplitude slider: adjust wave height
- See constructive (red) and destructive (blue) interference

**Charged Particles**
- 500 particles responding to Coulomb forces
- Red/blue spheres are fixed positive/negative charges
- Watch particles move toward/away based on charge

## Step 5: Deploy Live

### Option A: GitHub Pages (Free)

```bash
# Build for production
npm run build

# Deploy the 'dist/' folder to GitHub Pages
# See: https://vitejs.dev/guide/static-deploy.html#github-pages
```

### Option B: Vercel (Free, 1 click)

1. Push your repo to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Click Deploy

Your live URL: `https://[your-project].vercel.app`

## Step 6: Customize

Edit `physics-viz.js` to:
- Change particle counts
- Adjust physics parameters
- Add new simulations
- Modify colors/gradients

Edit `style.css` to:
- Change UI colors
- Adjust panel width
- Modify button styles

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- --port 3001
```

**Three.js not loading?**
```bash
npm install three --save
```

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## What's Next?

1. Write a blog post explaining the physics
2. Add more simulations (Lorenz attractor, fluid dynamics, etc.)
3. Implement export functionality (save as PNG/video)
4. Add keyboard shortcuts
5. Create interactive tutorials

Good luck! 🚀

