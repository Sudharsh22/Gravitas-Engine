import * as THREE from 'three';

export class WaveInterferenceSimulation {
    constructor(scene, bloomPass) {
        this.scene = scene;
        this.bloomPass = bloomPass;
        this.particleCount = 16384; 
        this.frequency = 0.5;
        this.amplitude = 8;
    }

    init() {
        this.bloomPass.strength = 1.0;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        const gridSize = 160;
        const gridDim = Math.sqrt(this.particleCount);

        for(let x = 0; x < gridDim; x++) {
            for(let y = 0; y < gridDim; y++) {
                positions.push(
                    (x / gridDim - 0.5) * gridSize,
                    0,
                    (y / gridDim - 0.5) * gridSize
                );
                colors.push(0.5, 0.5, 0.5);
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.wave = new THREE.Points(geometry, material);
        this.scene.add(this.wave);

        this.gridDim = gridDim;
        this.time = 0;

        const srcGeo = new THREE.SphereGeometry(2, 16, 16);
        this.src1 = new THREE.Mesh(srcGeo, new THREE.MeshBasicMaterial({color: 0x6b4cff}));
        this.src2 = new THREE.Mesh(srcGeo, new THREE.MeshBasicMaterial({color: 0x00d2ff}));
        this.scene.add(this.src1);
        this.scene.add(this.src2);
    }

    update(dt) {
        this.time += dt * 2.0; 
        const positions = this.wave.geometry.attributes.position.array;
        const colors = this.wave.geometry.attributes.color.array;

        const s1z = -20 + Math.sin(this.time * 0.2) * 10;
        const s2z = 20 + Math.cos(this.time * 0.25) * 10;
        
        this.src1.position.set(0, 0, s1z);
        this.src2.position.set(0, 0, s2z);

        let idx = 0;
        for(let x = 0; x < this.gridDim; x++) {
            for(let y = 0; y < this.gridDim; y++) {
                const px = (x / this.gridDim - 0.5) * 160;
                const pz = (y / this.gridDim - 0.5) * 160;

                const d1 = Math.sqrt(px*px + (pz - s1z)*(pz - s1z));
                const d2 = Math.sqrt(px*px + (pz - s2z)*(pz - s2z));

                const att1 = Math.max(1 / (d1 * 0.1 + 1), 0.1);
                const att2 = Math.max(1 / (d2 * 0.1 + 1), 0.1);

                const wave1 = this.amplitude * att1 * Math.sin(this.frequency * d1 - this.time * 4);
                const wave2 = this.amplitude * att2 * Math.sin(this.frequency * d2 - this.time * 4);
                const total = wave1 + wave2;

                positions[idx * 3 + 1] = total;

                const heightPhase = (total / (this.amplitude * 1.5)); 
                
                if (heightPhase > 0) {
                    colors[idx * 3] = 0.0;
                    colors[idx * 3 + 1] = 0.8 * heightPhase;
                    colors[idx * 3 + 2] = 1.0;
                } else {
                    colors[idx * 3] = 0.4 * -heightPhase;
                    colors[idx * 3 + 1] = 0.2;
                    colors[idx * 3 + 2] = 1.0;
                }

                idx++;
            }
        }

        this.wave.geometry.attributes.position.needsUpdate = true;
        this.wave.geometry.attributes.color.needsUpdate = true;
    }

    cleanup() {
        this.scene.remove(this.wave);
        this.scene.remove(this.src1);
        this.scene.remove(this.src2);
    }

    getControlsHTML() {
        return `
            <div class="control-group">
                <label>Wave Frequency <span id="freq-val">${this.frequency.toFixed(2)}</span></label>
                <input type="range" min="0.1" max="2.0" step="0.05" value="${this.frequency}" class="freq-slider">
            </div>
            <div class="control-group">
                <label>Wave Amplitude <span id="amp-val">${this.amplitude}</span></label>
                <input type="range" min="2" max="20" value="${this.amplitude}" class="amp-slider">
            </div>
        `;
    }

    attachControlListeners() {
        document.querySelector('.freq-slider').addEventListener('input', (e) => {
            this.frequency = parseFloat(e.target.value);
            document.getElementById('freq-val').textContent = this.frequency.toFixed(2);
        });
        document.querySelector('.amp-slider').addEventListener('input', (e) => {
            this.amplitude = parseFloat(e.target.value);
            document.getElementById('amp-val').textContent = this.amplitude;
        });
    }
}
