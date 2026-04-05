import * as THREE from 'three';

export class BlackHoleSimulation {
    constructor(scene, bloomPass) {
        this.scene = scene;
        this.bloomPass = bloomPass;
        this.particleCount = 50000;
        this.G_M = 3000;
        this.eventHorizonRadius = 15;
    }

    init() {
        this.bloomPass.strength = 1.6;
        this.bloomPass.threshold = 0.1;

        const particlesGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(this.particleCount * 3);
        const colorArray = new Float32Array(this.particleCount * 3);
        const sizeArray = new Float32Array(this.particleCount);
        this.velocities = [];

        for(let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            // Density distribution favors closer to the hole
            const r = 25 + Math.pow(Math.random(), 2) * 280;
            const theta = Math.random() * Math.PI * 2;
            const diskThickness = 60 / Math.max(r / 20, 1);
            const y = (Math.random() - 0.5) * diskThickness * (Math.random() * Math.random());

            posArray[idx] = r * Math.cos(theta);
            posArray[idx+1] = y;
            posArray[idx+2] = r * Math.sin(theta);

            // Keplerian velocity approximation with some inward drag
            const orbitalSpeed = Math.sqrt(this.G_M / r);
            const inwardDrift = 1.2;

            this.velocities.push({
                x: -Math.sin(theta) * orbitalSpeed - Math.cos(theta) * inwardDrift,
                y: (Math.random() - 0.5) * 0.5,
                z: Math.cos(theta) * orbitalSpeed - Math.sin(theta) * inwardDrift,
                active: true
            });

            this.updateColorAndSize(i, r, posArray, colorArray, sizeArray);
        }

        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

        const particlesMat = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(particlesGeo, particlesMat);
        this.scene.add(this.particleSystem);

        // Event horizon (Singularity)
        const bhGeometry = new THREE.SphereGeometry(this.eventHorizonRadius, 64, 64);
        const bhMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.blackHole = new THREE.Mesh(bhGeometry, bhMaterial);
        this.scene.add(this.blackHole);

        // Photon Sphere Inner Glow
        const photonGeo = new THREE.SphereGeometry(this.eventHorizonRadius * 1.5, 64, 64);
        const photonMat = new THREE.MeshBasicMaterial({
            color: 0xff6b6b,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        this.photonSphere = new THREE.Mesh(photonGeo, photonMat);
        this.scene.add(this.photonSphere);
    }

    updateColorAndSize(i, r, positions, colors, sizes) {
        const distNormalized = Math.min(1.0, Math.max(0.0, (r - this.eventHorizonRadius) / 150));
        const cColor = new THREE.Color();
        
        // Doppler & thermal shifting (Blue/White hot near center, orange/red outward)
        if (distNormalized < 0.1) {
            cColor.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0xaae8ff), distNormalized / 0.1);
        } else if (distNormalized < 0.3) {
            cColor.lerpColors(new THREE.Color(0xaae8ff), new THREE.Color(0xffaa44), (distNormalized - 0.1) / 0.2);
        } else if (distNormalized < 0.6) {
            cColor.lerpColors(new THREE.Color(0xffaa44), new THREE.Color(0xcc2222), (distNormalized - 0.3) / 0.3);
        } else {
            cColor.lerpColors(new THREE.Color(0xcc2222), new THREE.Color(0x1a1a3a), (distNormalized - 0.6) / 0.4);
        }
        
        colors[i*3] = cColor.r;
        colors[i*3+1] = cColor.g;
        colors[i*3+2] = cColor.b;

        const sizeVariation = 1.0 - (distNormalized * 0.6);
        sizes[i] = 1.2 * sizeVariation * (0.5 + Math.random() * 0.5);
    }

    update(dt) {
        const simDt = dt * 1.5;
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;

        for(let i = 0; i < this.particleCount; i++) {
            const vel = this.velocities[i];
            if (!vel.active) continue;

            const idx = i * 3;
            const px = positions[idx];
            const py = positions[idx+1];
            const pz = positions[idx+2];

            const rSq = px*px + py*py + pz*pz;
            const r = Math.sqrt(rSq);

            if (r < this.eventHorizonRadius + 2) {
                const newR = 280 + Math.random() * 20;
                const theta = Math.random() * Math.PI * 2;
                positions[idx] = newR * Math.cos(theta);
                positions[idx+1] = (Math.random() - 0.5) * 10;
                positions[idx+2] = newR * Math.sin(theta);
                
                const orbitalSpeed = Math.sqrt(this.G_M / newR);
                vel.x = -Math.sin(theta) * orbitalSpeed;
                vel.y = (Math.random() - 0.5) * 0.5;
                vel.z = Math.cos(theta) * orbitalSpeed;
                continue;
            }

            const pW_r = Math.max(r - this.eventHorizonRadius, 0.1);
            const accelMag = this.G_M / (pW_r * pW_r);
            
            const ax = -(px / r) * accelMag;
            const ay = -(py / r) * accelMag * 0.8; 
            const az = -(pz / r) * accelMag;

            vel.x += ax * simDt;
            vel.y += ay * simDt;
            vel.z += az * simDt;

            const friction = 0.999;
            vel.x *= friction;
            vel.y *= friction;
            vel.z *= friction;

            positions[idx] += vel.x * simDt;
            positions[idx+1] += vel.y * simDt;
            positions[idx+2] += vel.z * simDt;

            if (Math.random() < 0.05) {
                this.updateColorAndSize(i, r, positions, colors, sizes);
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
        this.particleSystem.geometry.attributes.size.needsUpdate = true;
    }

    cleanup() {
        this.scene.remove(this.particleSystem);
        this.scene.remove(this.blackHole);
        this.scene.remove(this.photonSphere);
    }

    getControlsHTML() {
        return `
            <div class="control-group">
                <label>Singularity Mass <span id="gravity-val">${this.G_M}</span></label>
                <input type="range" min="1000" max="8000" value="${this.G_M}" class="gravity-slider">
            </div>
        `;
    }

    attachControlListeners() {
        document.querySelector('.gravity-slider').addEventListener('input', (e) => {
            this.G_M = parseFloat(e.target.value);
            document.getElementById('gravity-val').textContent = this.G_M;
        });
    }
}
