import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Import local simulations
import { BlackHoleSimulation } from './simulations/blackhole.js';
import { NBodySimulation } from './simulations/nbody.js';
import { WaveInterferenceSimulation } from './simulations/waves.js';
import { ChargedParticleSimulation } from './simulations/electrodynamics.js';

// ============================================
// GRAVITAS PHYSICS VISUALIZATION ENGINE
// ============================================

class PhysicsViz {
    constructor() {
        this.setupScene();
        this.setupControls();
        this.currentSimulation = 'blackhole';
        this.simulations = {};
        this.initSimulations();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
        this.scene.fog = new THREE.FogExp2(0x050508, 0.0025);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, 45, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;
        document.getElementById('app').appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 1000;

        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0.15;
        this.bloomPass.strength = 1.4;
        this.bloomPass.radius = 0.8;
        this.composer.addPass(this.bloomPass);

        window.addEventListener('resize', () => this.onWindowResize());
        
        const ambientLight = new THREE.AmbientLight(0x202030, 0.4);
        this.scene.add(ambientLight);
        this.pointLight = new THREE.PointLight(0x6b4cff, 2.5, 500);
        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);

        this.clock = new THREE.Clock();
    }

    setupControls() {
        const ui = document.createElement('div');
        ui.id = 'physics-ui';
        ui.innerHTML = `
            <div class="ui-header">Gravitas Engine</div>
            
            <div class="sim-selector">
                <button class="sim-btn active" data-sim="blackhole">Black Hole Accretion</button>
                <button class="sim-btn" data-sim="nbody">N-Body Gravity</button>
                <button class="sim-btn" data-sim="waves">Wave Mechanics</button>
                <button class="sim-btn" data-sim="charged">Electrodynamics</button>
            </div>

            <div id="sim-controls" class="sim-controls">
                <!-- Dynamic controls per simulation -->
            </div>

            <div class="metrics">
                <div class="metric">FPS <span id="fps">60</span></div>
                <div class="metric">Active Bodies <span id="particle-count">0</span></div>
                <div class="metric">Sim Time <span id="sim-time">0.0s</span></div>
            </div>
        `;
        document.body.appendChild(ui);

        document.querySelectorAll('.sim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSimulation(e.target.dataset.sim));
        });
    }

    initSimulations() {
        this.simulations = {
            blackhole: new BlackHoleSimulation(this.scene, this.bloomPass),
            nbody: new NBodySimulation(this.scene, this.bloomPass),
            waves: new WaveInterferenceSimulation(this.scene, this.bloomPass),
            charged: new ChargedParticleSimulation(this.scene, this.bloomPass)
        };
    }

    switchSimulation(simName) {
        if (this.simulations[this.currentSimulation]) {
            this.simulations[this.currentSimulation].cleanup();
        }

        this.currentSimulation = simName;
        this.simulations[simName].init();

        document.querySelectorAll('.sim-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sim === simName);
        });

        const controlsDiv = document.getElementById('sim-controls');
        controlsDiv.innerHTML = this.simulations[simName].getControlsHTML();
        this.simulations[simName].attachControlListeners();

        if(simName === 'blackhole') {
            this.camera.position.set(0, 45, 100);
        } else {
            this.camera.position.set(0, 100, 150);
        }
        this.controls.target.set(0,0,0);
        this.controls.reset();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.controls.update();

        this.simulations[this.currentSimulation].update(dt);

        const fps = Math.round(1 / (dt || 0.016));
        document.getElementById('fps').textContent = fps;
        document.getElementById('particle-count').textContent = this.simulations[this.currentSimulation].particleCount || 0;
        document.getElementById('sim-time').textContent = (this.clock.getElapsedTime()).toFixed(1);

        this.composer.render();
    }
}

// Initialize
new PhysicsViz();
