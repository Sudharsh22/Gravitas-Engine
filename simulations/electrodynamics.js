import * as THREE from 'three';

export class ChargedParticleSimulation {
    constructor(scene, bloomPass) {
        this.scene = scene;
        this.bloomPass = bloomPass;
        this.particleCount = 400;
        this.particles = [];
        this.k = 250; 
        
        this.dipoleSources = [];
    }

    init() {
        this.bloomPass.strength = 1.8;
        this.particles = [];
        
        const geometry = new THREE.SphereGeometry(1.0, 16, 16);

        for(let i = 0; i < this.particleCount; i++) {
            const isPositive = Math.random() > 0.5;
            const colorHex = isPositive ? 0x6b4cff : 0x00d2ff;
            const material = new THREE.MeshBasicMaterial({ color: colorHex });
            const mesh = new THREE.Mesh(geometry, material);
            
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 160,
                (Math.random() - 0.5) * 160,
                0 
            );
            mesh.position.copy(pos);
            this.scene.add(mesh);

            this.particles.push({
                mesh: mesh,
                pos: pos,
                vel: new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0),
                acc: new THREE.Vector3(),
                charge: isPositive ? 1 : -1,
                mass: 1
            });
        }

        const chargeGeometry = new THREE.SphereGeometry(4, 32, 32);
        
        const posCharge = new THREE.Mesh(chargeGeometry, new THREE.MeshBasicMaterial({ color: 0x6b4cff }));
        posCharge.position.set(40, 0, 0);
        this.scene.add(posCharge);

        const negCharge = new THREE.Mesh(chargeGeometry, new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
        negCharge.position.set(-40, 0, 0);
        this.scene.add(negCharge);

        this.dipoleSources = [
            { pos: new THREE.Vector3(40, 0, 0), charge: 50 },
            { pos: new THREE.Vector3(-40, 0, 0), charge: -50 }
        ];

        this.fixedMeshes = [posCharge, negCharge];
        
        this.calculateAccelerations();
    }

    calculateAccelerations() {
        for(let i = 0; i < this.particles.length; i++) {
            this.particles[i].acc.set(0,0,0);
        }

        for(let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            for(let s = 0; s < this.dipoleSources.length; s++) {
                const source = this.dipoleSources[s];
                const diff = new THREE.Vector3().subVectors(p.pos, source.pos);
                const distSq = diff.lengthSq() + 10; 
                const dist = Math.sqrt(distSq);
                
                const forceMag = (this.k * p.charge * source.charge) / distSq;
                p.acc.add(diff.normalize().multiplyScalar(forceMag / p.mass));
            }

            for(let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const diff = new THREE.Vector3().subVectors(p.pos, other.pos);
                const distSq = diff.lengthSq() + 5.0; 

                const forceMag = (this.k * 0.05 * p.charge * other.charge) / distSq;
                const forceVec = diff.normalize().multiplyScalar(forceMag);

                p.acc.add(forceVec.clone().multiplyScalar(1 / p.mass));
                other.acc.sub(forceVec.clone().multiplyScalar(1 / other.mass));
            }
            
            const B = new THREE.Vector3(0, 0, 0.05); 
            const lorentz = p.vel.clone().cross(B).multiplyScalar(p.charge);
            p.acc.add(lorentz);

            p.acc.add(p.pos.clone().multiplyScalar(-0.01));
        }
    }

    update(dt) {
        const subSteps = 2;
        const subDt = dt / subSteps;

        for(let step = 0; step < subSteps; step++) {
            for(let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.pos.add(p.vel.clone().multiplyScalar(subDt)).add(p.acc.clone().multiplyScalar(0.5 * subDt * subDt));
                p.pos.z *= 0.9; 
            }

            const oldAcc = this.particles.map(p => p.acc.clone());
            this.calculateAccelerations();

            for(let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const avgAcc = oldAcc[i].add(p.acc).multiplyScalar(0.5);
                p.vel.add(avgAcc.multiplyScalar(subDt));
                p.vel.multiplyScalar(0.995); 
                p.mesh.position.copy(p.pos);
            }
        }
    }

    cleanup() {
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.fixedMeshes.forEach(m => this.scene.remove(m));
        this.particles = [];
    }

    getControlsHTML() {
        return `
            <div class="control-group">
                <label>Coulomb Multiplier <span id="coulomb-val">${this.k}</span></label>
                <input type="range" min="50" max="600" step="10" value="${this.k}" class="coulomb-slider">
            </div>
        `;
    }

    attachControlListeners() {
        document.querySelector('.coulomb-slider').addEventListener('input', (e) => {
            this.k = parseFloat(e.target.value);
            document.getElementById('coulomb-val').textContent = this.k;
        });
    }
}
