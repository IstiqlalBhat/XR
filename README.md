# 🎨 Gesture Controlled 3D Particle System

An interactive 3D particle system controlled by hand gestures using MediaPipe and Three.js.

## ✨ Features

- **Hand Gesture Control**: Scale and rotate particles using hand movements
- **Multiple Shapes**: Heart, Flower, Saturn, Buddha Statue, Fireworks, and Sphere
- **Real-time Response**: Smooth, responsive particle animations
- **Color Customization**: Choose any color for the particles
- **Modern UI**: Beautiful glassmorphic interface

## 📁 Project Structure

```
CodeJaai/
├── index.html              # Main HTML file
├── styles.css              # All styling
├── js/
│   ├── main.js            # Entry point
│   ├── config.js          # Configuration & constants
│   ├── smoothing.js       # Smoothing algorithms
│   ├── hand-tracking.js   # Hand tracking state management
│   ├── gesture-detection.js # Gesture detection functions
│   ├── shape-generator.js # 3D shape generation
│   ├── particle-system.js # Three.js particle system
│   ├── ui-manager.js      # UI update management
│   ├── camera-preview.js  # Camera feed rendering
│   └── particle-controller.js # Main controller
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access

### Running Locally

1. **Clone or download** this repository

2. **Serve the files** using a local web server:

   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open** your browser and navigate to:
   ```
   http://localhost:8000
   ```

4. **Allow camera access** when prompted

> ⚠️ **Important**: The application must be served via HTTP/HTTPS. Opening `index.html` directly as a file won't work due to ES6 module restrictions.

## 🎮 How to Use

### Gesture Controls

| Gesture | Action |
|---------|--------|
| ✋↔️✋ **Two hands apart/together** | Scale particles up/down |
| 🤏 **Pinch** (thumb + index) | Compress particles |
| 🖐️ **Tilt hand** up/down | Rotate on X-axis |
| 🖐️ **Tilt hand** left/right | Rotate on Y-axis |
| ✊ **Make a fist** | Lock current rotation |

### UI Controls

- **Shape Buttons**: Click to morph particles into different shapes
- **Gesture Mode**: Toggle between Scale, Rotate, or Both
- **Color Picker**: Change particle color
- **Indicators**: Real-time feedback on scale and rotation

## 🏗️ Architecture

### Module Overview

1. **config.js**: Centralized configuration for easy tuning
2. **smoothing.js**: Implements smooth value interpolation and filtering
3. **hand-tracking.js**: Manages hand detection state with grace periods
4. **gesture-detection.js**: Pure functions for gesture analysis
5. **shape-generator.js**: Mathematical functions for 3D shapes
6. **particle-system.js**: Three.js particle rendering and animation
7. **ui-manager.js**: DOM manipulation and UI updates
8. **camera-preview.js**: Video feed with hand landmarks
9. **particle-controller.js**: Orchestrates all modules
10. **main.js**: Application initialization

### Key Technologies

- **Three.js**: 3D rendering and particle system
- **MediaPipe Hands**: Real-time hand tracking
- **ES6 Modules**: Clean, modular code organization
- **Custom Smoothing**: Critically damped springs for smooth motion

## 🎨 Customization

### Adjusting Particle Count

Edit `js/config.js`:

```javascript
particle: {
    count: 18000,  // Change this value
    // ...
}
```

### Adding New Shapes

1. Add shape function to `js/shape-generator.js`:
   ```javascript
   myNewShape() {
       // Return {x, y, z} coordinates
   }
   ```

2. Add button in `index.html`:
   ```html
   <button class="shape-btn" data-shape="myNewShape">
       <span class="icon">🔷</span>
       New Shape
   </button>
   ```

### Tuning Smoothness

Adjust in `js/config.js`:

```javascript
smoothing: {
    scale: { 
        factor: 0.12,    // Higher = faster response
        deadZone: 0.02   // Lower = more sensitive
    },
    // ...
}
```

## 🐛 Troubleshooting

### Camera not working
- Ensure you've granted camera permissions
- Check if another application is using the camera
- Try refreshing the page

### Gestures not responding
- Ensure good lighting conditions
- Keep hands visible in camera view
- Try adjusting hand distance from camera

### Module loading errors
- Make sure you're serving via HTTP/HTTPS
- Check browser console for specific errors
- Ensure all files are in correct directories

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

- **Three.js** - 3D rendering library
- **MediaPipe** - Hand tracking by Google
- **Sora Font** - Google Fonts

---

Made with ✨ and JavaScript

