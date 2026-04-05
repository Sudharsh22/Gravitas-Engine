import * as THREE from 'three';

export class NBodySimulation {
    constructor(scene, bloomPass) {
        this.scene = scene;
        this.bloomPass = bloomPass;
        this.particleCount = 150;
        this.bodies = [];
        this.G = 40;
    }

    init() {
        this.bloomPass.strength = 2.0;

        this.bodies = [];
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x00d2ff, 0x6b4cff];
        
        for(let i = 0; i < this.particleCount; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 150
            );

            const geometry = new THREE.SphereGeometry(1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);
            this.scene.add(mesh);

            const glowGeo = new THREE.SphereGeometry(2.5, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            const glowMesh = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glowMesh);

            const r = pos.length();
            const vel = new THREE.Vector3();
            if (r > 10) {
                vel.copy(pos).cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(Math.sqrt(this.G * 100 / r));
            } else {
                vel.set((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2);
            }

            this.bodies.push({
                mesh: mesh,
                pos: pos,
                vel: vel,
                acc: new THREE.Vector3(),
                mass: 1 + Math.random() * 3
            });
        }
        
        this.calculateAccelerations();
    }

    calculateAccelerations() {
        for(let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].acc.set(0,0,0);
        }

        for(let i = 0; i < this.bodies.length; i++) {
            for(let j = i + 1; j < this.bodies.length; j++) {
                const b1 = this.bodies[i];
                const b2 = this.bodies[j];

                const diff = new THREE.Vector3().subVectors(b2.pos, b1.pos);
                const distSq = diff.lengthSq();
                
                const softDistSq = distSq + 4.0; 
                const dist = Math.sqrt(softDistSq);

                const forceMag = (this.G * b1.mass * b2.mass) / softDistSq;
                diff.normalize().multiplyScalar(forceMag);

                b1.acc.add(diff.clone().multiplyScalar(1 / b1.mass));
                b2.acc.sub(diff.clone().multiplyScalar(1 / b2.mass));
            }
            
            const centralAttract = this.bodies[i].pos.clone().multiplyScalar(-0.01);
            this.bodies[i].acc.add(centralAttract);
        }
    }

    update(dt) {
        const subSteps = 2;
        const subDt = dt / subSteps;

        for(let step = 0; step < subSteps; step++) {
            for(let i = 0; i < this.bodies.length; i++) {
                const b = this.bodies[i];
                b.pos.add(b.vel.clone().multiplyScalar(subDt)).add(b.acc.clone().multiplyScalar(0.5 * subDt * subDt));
            }

            const oldAcc = this.bodies.map(b => b.acc.clone());

            this.calculateAccelerations();

            for(let i = 0; i < this.bodies.length; i++) {
                const b = this.bodies[i];
                const avgAcc = oldAcc[i].add(b.acc).multiplyScalar(0.5);
                b.vel.add(avgAcc.multiplyScalar(subDt));
                
                b.mesh.position.copy(b.pos);
            }
        }
    }

    cleanup() {
        this.bodies.forEach(b => this.scene.remove(b.mesh));
        this.bodies = [];
    }

    getControlsHTML() {
        return `
            <div class="control-group">
                <label>Gravitational Constant G <span id="g-val">${this.G}</span></label>
                <input type="range" min="10" max="150" value="${this.G}" class="g-slider">
            </div>
        `;
    }

    attachControlListeners() {
        document.querySelector('.g-slider').addEventListener('input', (e) => {
            this.G = parseFloat(e.target.value);
            document.getElementById('g-val').textContent = this.G;
        });
    }
}
