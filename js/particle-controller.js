/**
 * Main Particle Controller
 * Orchestrates all modules and manages the application
 */

import { CONFIG } from './config.js';
import { SmoothValue, EMAFilter } from './smoothing.js';
import { HandTrackingState } from './hand-tracking.js';
import { GestureDetection } from './gesture-detection.js';
import { ShapeGenerator } from './shape-generator.js';
import { ParticleSystem } from './particle-system.js';
import { UIManager } from './ui-manager.js';
import { CameraPreview } from './camera-preview.js';

export class ParticleController {
    constructor() {
        this.config = CONFIG;
        this.gestureMode = 'both';
        this.currentShape = 'heart';
        this.autoRotate = true;
        this.baseRotationY = 0;
        
        this.initializeSmoothing();
        this.initializeThreeJS();
        this.initializeUI();
        this.initializeHandTracking();
        this.setupEventListeners();
        this.animate();
    }
    
    /**
     * Initialize smoothing system
     */
    initializeSmoothing() {
        const { scale, rotation, emaAlpha } = this.config.smoothing;
        
        // Smooth values for scale and rotation
        this.smoothScale = new SmoothValue(1.0, scale.factor, scale.deadZone);
        this.smoothRotationX = new SmoothValue(0, rotation.factor, rotation.deadZone);
        this.smoothRotationY = new SmoothValue(0, rotation.factor, rotation.deadZone);
        
        // EMA filters for raw input
        this.scaleFilter = new EMAFilter(emaAlpha.scale);
        this.rotXFilter = new EMAFilter(emaAlpha.rotation);
        this.rotYFilter = new EMAFilter(emaAlpha.rotation);
        this.pinchFilter = new EMAFilter(emaAlpha.pinch);
        
        // Hand tracking state
        this.handState = new HandTrackingState(this.config.hand.gracePeriod);
    }
    
    /**
     * Initialize Three.js scene, camera, and renderer
     */
    initializeThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x090a0f, 0.015);
        
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 8;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);
        
        this.particles = new ParticleSystem(this.scene, this.config.particle);
    }
    
    /**
     * Initialize UI managers
     */
    initializeUI() {
        this.uiManager = new UIManager();
        this.cameraPreview = new CameraPreview('preview-canvas', 200, 150);
    }
    
    /**
     * Initialize MediaPipe hand tracking
     */
    initializeHandTracking() {
        const videoElement = document.querySelector('.input_video');
        
        this.hands = new window.Hands({
            locateFile: (file) => 
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        this.hands.setOptions({
            maxNumHands: this.config.hand.maxHands,
            modelComplexity: 1,
            minDetectionConfidence: this.config.hand.detectionConfidence,
            minTrackingConfidence: this.config.hand.trackingConfidence
        });
        
        this.hands.onResults(this.onHandsResults.bind(this));
        
        this.cameraFeed = new window.Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        this.cameraFeed.start();
    }
    
    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Shape buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setShape(btn.dataset.shape, btn);
            });
        });
        
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => 
                    b.classList.remove('active'));
                btn.classList.add('active');
                this.gestureMode = btn.dataset.mode;
            });
        });
        
        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => {
            this.particles.setColor(e.target.value);
            this.uiManager.updateColorValue(e.target.value);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    /**
     * Set particle shape
     */
    setShape(type, buttonElement) {
        this.currentShape = type;
        const positions = ShapeGenerator.generate(type, this.config.particle.count);
        this.particles.setTargetPositions(positions);
        
        document.querySelectorAll('.shape-btn').forEach(b => 
            b.classList.remove('active'));
        if (buttonElement) {
            buttonElement.classList.add('active');
        }
    }
    
    /**
     * Handle hand tracking results from MediaPipe
     */
    onHandsResults(results) {
        this.uiManager.hideLoading();
        this.cameraPreview.draw(results);
        
        const trackingStatus = this.handState.updateTracking(
            results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
        
        if (trackingStatus.status === 'tracking') {
            this.processGestures(results.multiHandLandmarks);
        } else if (trackingStatus.status === 'lost') {
            this.handleNoHands(trackingStatus.timeSinceLost);
        }
    }
    
    /**
     * Process detected gestures
     */
    processGestures(hands) {
        if (hands.length >= 2) {
            this.processTwoHandGestures(hands[0], hands[1]);
        } else {
            this.processSingleHandGestures(hands[0]);
        }
    }
    
    /**
     * Process two-hand gestures (scale and rotation)
     */
    processTwoHandGestures(hand1, hand2) {
        // Scale: Distance between hands
        if (this.gestureMode === 'scale' || this.gestureMode === 'both') {
            const distance = GestureDetection.getTwoHandDistance(hand1, hand2);
            const filtered = this.scaleFilter.filter(distance);
            let scale = 0.3 + (filtered * 3.5);
            scale = Math.min(Math.max(scale, 0.2), 2.8);
            this.smoothScale.setTarget(scale);
        }
        
        // Rotation: Two-hand steering gesture
        if (this.gestureMode === 'rotate' || this.gestureMode === 'both') {
            const rot = GestureDetection.getTwoHandRotation(hand1, hand2);
            this.smoothRotationY.setTarget(this.rotYFilter.filter(rot.yRotation * 2));
            this.smoothRotationX.setTarget(this.rotXFilter.filter(rot.xRotation * 0.8));
            this.autoRotate = false;
        }
        
        this.uiManager.updateStatus('rotate', 'Two hands: Steering control');
    }
    
    /**
     * Process single-hand gestures
     */
    processSingleHandGestures(hand) {
        if (GestureDetection.isFist(hand)) {
            this.autoRotate = false;
            this.uiManager.updateStatus('pinch', 'Fist: Rotation locked');
            return;
        }
        
        // Scale: Pinch gesture
        if (this.gestureMode === 'scale' || this.gestureMode === 'both') {
            const pinch = GestureDetection.getPinchDistance(hand);
            const filtered = this.pinchFilter.filter(pinch);
            let scale = 0.3 + (filtered * 8);
            scale = Math.min(Math.max(scale, 0.2), 2.5);
            this.smoothScale.setTarget(scale);
        }
        
        // Rotation: Hand tilt
        if (this.gestureMode === 'rotate' || this.gestureMode === 'both') {
            const orientation = GestureDetection.getHandOrientation(hand);
            this.smoothRotationX.setTarget(this.rotXFilter.filter(orientation.tiltX * 1.2));
            this.smoothRotationY.setTarget(this.rotYFilter.filter(orientation.tiltY * 0.8));
            this.autoRotate = false;
        }
        
        // Update UI status based on pinch distance
        const pinchDist = GestureDetection.getPinchDistance(hand);
        const statusClass = pinchDist < 0.05 ? 'pinch' : 'active';
        const statusText = pinchDist < 0.05 ? 'Pinching (Compress)' :
            this.gestureMode === 'rotate' ? 'Tilt to rotate' :
            this.gestureMode === 'both' ? 'Tilt + Pinch active' :
            'Open hand (Expand)';
        
        this.uiManager.updateStatus(statusClass, statusText);
    }
    
    /**
     * Handle when no hands are detected
     */
    handleNoHands(timeSinceLost) {
        // Reset filters after grace period
        if (timeSinceLost > this.config.hand.gracePeriod + 500) {
            this.scaleFilter.reset();
            this.rotXFilter.reset();
            this.rotYFilter.reset();
            this.pinchFilter.reset();
        }
        
        this.autoRotate = true;
        this.uiManager.updateStatus('', 'No hands detected');
    }
    
    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const trackingStatus = this.handState.updateTracking(false);
        let currentScale, currentRotX, currentRotY;
        
        // Update smooth values based on tracking state
        if (trackingStatus.status === 'tracking' || 
            trackingStatus.status === 'grace') {
            // Active tracking or grace period
            currentScale = this.smoothScale.update();
            currentRotX = this.smoothRotationX.update();
            currentRotY = this.smoothRotationY.update();
        } else {
            // No hands - return to defaults
            currentScale = this.smoothScale.updateSlow(1.0);
            
            if (this.autoRotate) {
                this.baseRotationY += this.config.autoRotate.speed;
                const time = Date.now() * 0.001;
                this.smoothRotationY.target = this.baseRotationY;
                this.smoothRotationX.target = 
                    Math.sin(time * this.config.autoRotate.oscillation.frequency) * 
                    this.config.autoRotate.oscillation.amplitude;
                currentRotX = this.smoothRotationX.update();
                currentRotY = this.smoothRotationY.update();
            } else {
                currentRotX = this.smoothRotationX.updateSlow(0);
                currentRotY = this.smoothRotationY.updateSlow(this.baseRotationY);
            }
        }
        
        // Update particles
        this.particles.update();
        this.particles.setTransform(currentScale, currentRotX, currentRotY);
        
        // Update UI
        this.uiManager.updateIndicators(currentScale, currentRotX, currentRotY);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

