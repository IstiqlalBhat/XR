# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A gesture-controlled 3D particle system using MediaPipe for hand tracking and Three.js for rendering. The application allows users to manipulate particle formations (heart, flower, Saturn, Buddha, fireworks, sphere) through hand gestures captured via webcam.

## Development Commands

### Running the Application

The project uses pure JavaScript with ES6 modules and requires a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Access at: `http://localhost:8000`

**Important**: Cannot be opened directly as a file due to ES6 module restrictions and CORS policies.

## Architecture

### Module System

The codebase follows a modular architecture with clear separation of concerns:

1. **main.js** - Entry point that initializes ParticleController
2. **particle-controller.js** - Central orchestrator that coordinates all modules
3. **config.js** - Centralized configuration (particle count, smoothing factors, hand tracking settings)
4. **smoothing.js** - Implements critically damped springs and EMA filters for smooth motion
5. **hand-tracking.js** - State management for hand detection with grace periods
6. **gesture-detection.js** - Pure functions for gesture analysis (fist, pinch, orientation, two-hand distance)
7. **shape-generator.js** - Mathematical functions generating 3D coordinates for each shape
8. **particle-system.js** - Three.js particle rendering, morphing, and transformations
9. **ui-manager.js** - DOM manipulation and UI state updates
10. **camera-preview.js** - Video feed rendering with hand landmarks overlay

### Data Flow

```
MediaPipe Hand Detection
    ↓
CameraPreview (draws landmarks)
    ↓
HandTrackingState (manages grace periods)
    ↓
GestureDetection (analyzes hand positions)
    ↓
Smoothing Filters (EMA + Critically Damped Springs)
    ↓
ParticleSystem.setTransform()
    ↓
Three.js Renderer
```

### Key Architectural Patterns

**State Management**: `ParticleController` maintains application state (gestureMode, currentShape, autoRotate, smoothing instances). All state updates flow through this controller.

**Smoothing Pipeline**: Raw gesture data flows through a two-stage pipeline:
- EMA filters for noise reduction
- Critically damped springs (SmoothValue) for natural motion
- Configurable dead zones prevent jitter

**Hand Tracking States**: Three-state system handled by `HandTrackingState`:
- `tracking`: Hands detected, gestures processed
- `grace`: Recently lost hands, maintains last values
- `lost`: No hands, returns to auto-rotation

**Gesture Modes**: Affects which gestures are processed:
- `scale`: Only pinch/two-hand distance affects scale
- `rotate`: Only tilt/two-hand steering affects rotation
- `both`: All gestures active (default)

**Particle Morphing**: Each shape has target positions. Particles lerp toward targets using `CONFIG.particle.morphSpeed`. New shape selection triggers position recalculation for all particles.

## Configuration

All tuning parameters centralized in `js/config.js`:

- `particle.count`: Number of particles (default: 18000)
- `particle.morphSpeed`: Speed of shape transitions (0.04)
- `smoothing.scale.factor`: Responsiveness of scale changes (0.12)
- `smoothing.rotation.factor`: Responsiveness of rotation (0.08)
- `smoothing.emaAlpha.*`: Filter strengths for noise reduction
- `hand.gracePeriod`: Milliseconds before "hand lost" triggers (500ms)
- `autoRotate.speed`: Y-axis rotation speed when idle (0.003)

## Adding New Shapes

1. Add shape generation function to `ShapeGenerator` object in `js/shape-generator.js`:
   ```javascript
   myShape() {
       // Return {x, y, z} coordinates
       // Called once per particle
   }
   ```

2. Add corresponding button in `index.html`:
   ```html
   <button class="shape-btn" data-shape="myShape">
       <span class="icon">🔷</span>
       Shape Name
   </button>
   ```

3. The shape name in `data-shape` must match the function name in `ShapeGenerator`

## External Dependencies

Loaded via CDN (specified in `index.html`):
- Three.js r128 (3D rendering)
- MediaPipe Hands (hand tracking)
- MediaPipe camera/control/drawing utilities
- Google Fonts (Sora font family)

## Browser Requirements

- WebGL support (for Three.js)
- WebRTC/getUserMedia (for webcam access)
- ES6 modules support
- Modern browser (Chrome, Firefox, Edge, Safari)
