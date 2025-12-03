/**
 * Particle System Module
 * Manages Three.js particle rendering and animation
 */

export class ParticleSystem {
    constructor(scene, config) {
        this.config = config;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(config.count * 3);
        this.targetPositions = new Float32Array(config.count * 3);
        this.velocities = new Float32Array(config.count * 3);
        
        // Initialize random positions
        for (let i = 0; i < config.count * 3; i++) {
            this.positions[i] = (Math.random() - 0.5) * 10;
            this.targetPositions[i] = this.positions[i];
            this.velocities[i] = 0;
        }
        
        this.geometry.setAttribute('position', 
            new THREE.BufferAttribute(this.positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00d4ff,
            size: config.size,
            map: this.createTexture(),
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        this.mesh = new THREE.Points(this.geometry, material);
        scene.add(this.mesh);
    }
    
    /**
     * Create soft glowing texture for particles
     */
    createTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; 
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    /**
     * Set target positions for particle morphing
     */
    setTargetPositions(positions) {
        for (let i = 0; i < this.targetPositions.length; i++) {
            this.targetPositions[i] = positions[i];
        }
    }
    
    /**
     * Update particle positions with velocity-based morphing
     */
    update() {
        const { morphSpeed, velocityDamping } = this.config;
        const posAttr = this.geometry.attributes.position;
        const array = posAttr.array;
        
        for (let i = 0; i < this.config.count * 3; i++) {
            const diff = this.targetPositions[i] - array[i];
            this.velocities[i] += diff * morphSpeed;
            this.velocities[i] *= velocityDamping;
            array[i] += this.velocities[i];
        }
        
        posAttr.needsUpdate = true;
    }
    
    /**
     * Set particle color
     */
    setColor(color) {
        this.mesh.material.color.set(color);
    }
    
    /**
     * Set particle system transform (scale and rotation)
     */
    setTransform(scale, rotX, rotY) {
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.rotation.x = rotX;
        this.mesh.rotation.y = rotY;
    }
}

