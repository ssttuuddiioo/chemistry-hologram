# Chemistry Elements - Interactive 3D Experience

An interactive Three.js application featuring a breakable hexagon that represents various chemistry elements and services. Click the hexagon to break it into floating, clickable pieces that showcase different aspects of chemistry and technology.

## Features

### Core Functionality
- **3D Hexagon**: A rotating hexagon in a vignette white space that serves as the main interactive element
- **Breakable Animation**: Click the hexagon to break it into floating pieces with physics simulation
- **Interactive Fragments**: Each piece represents a chemistry element and is clickable for more information
- **Camera Controls**: Full orbital camera controls with mouse interaction and scroll zoom
- **Keyboard Shortcuts**: Number keys (1-9) for quick element selection and 'R' for reset

### Chemistry Elements Included
1. **Technology** - Cutting-edge technological innovations
2. **Fabrication** - Advanced manufacturing processes
3. **Design** - Creative design thinking and aesthetic solutions
4. **AVL** - Analysis, Validation, and Laboratory services
5. **About** - Company story and mission
6. **Experiential** - Immersive chemistry experiences
7. **Experimental** - Research and development laboratory
8. **Community** - Global chemistry community connections
9. **NYC** - New York City innovation hub
10. **Ethos** - Core values and ethical principles
11. **People** - The brilliant minds behind the chemistry

### UI Controls
- **Scene Controls Panel** (Top Right):
  - Rotation Speed: Adjust hexagon rotation speed
  - Fragment Speed: Control how fast pieces move after explosion
  - Hexagon Color: Change the color of the main hexagon
  - Light Intensity: Adjust scene lighting
  - Reset Scene: Return to initial state

- **Element Information Panel** (Bottom Left):
  - Displays when clicking on fragments
  - Shows element name, description, and "Learn More" button
  - Auto-hides after 10 seconds

- **Shortcuts Reference** (Top Left):
  - Shows available keyboard shortcuts

- **Instructions** (Bottom Right):
  - Basic usage instructions

## Usage Instructions

### Basic Interaction
1. **Start**: The scene loads with a rotating blue hexagon in the center
2. **Break the Hexagon**: Click on the hexagon to break it into floating pieces
3. **Explore Elements**: Click on any floating piece to see its information
4. **Navigate**: Use mouse to rotate camera, scroll to zoom in/out
5. **Reset**: Click "Reset Scene" button or press 'R' to start over

### Keyboard Shortcuts
- `1-9`: Quickly select and view information for elements 1-9
- `R`: Reset the scene to initial state
- `Mouse Drag`: Rotate camera around the scene
- `Mouse Scroll`: Zoom in and out

### Advanced Controls
Use the control panel to customize the experience:
- Adjust rotation speed for a more dynamic or subtle effect
- Change fragment speed to make pieces move faster or slower
- Modify the hexagon color to match your preference
- Adjust lighting intensity for different atmospheric effects

## Technical Details

### Built With
- **Three.js** - 3D graphics library
- **OrbitControls** - Camera movement controls
- **HTML5/CSS3** - Modern web standards
- **JavaScript ES6+** - Modern JavaScript features

### Performance Features
- Optimized rendering with requestAnimationFrame
- Efficient raycasting for click detection
- Physics simulation with boundary collision
- Responsive design for different screen sizes

### Browser Support
- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile devices with WebGL capabilities

## File Structure
```
/
├── index.html          # Main HTML file with UI structure
├── app.js             # Three.js application logic
└── README.md          # Documentation
```

## Getting Started

1. Open `index.html` in a modern web browser
2. The scene will automatically load and initialize
3. Click the hexagon to begin exploring the chemistry elements
4. Use the controls to customize your experience

## Customization

The application is designed to be easily customizable:

### Adding New Elements
Edit the `chemistryElements` array in `app.js` to add or modify elements:

```javascript
{
    name: "Your Element",
    description: "Your description here",
    color: 0xhexcolor,
    url: "/your-url"
}
```

### Styling
Modify the CSS in `index.html` to change the appearance of UI panels and controls.

### Physics Parameters
Adjust physics constants in `app.js`:
- Fragment velocities
- Boundary sizes
- Damping factors
- Collision behavior

## Future Enhancements

Potential improvements could include:
- Sound effects for interactions
- Particle effects for the explosion
- More complex fragment shapes
- Animation between different scene states
- VR/AR support
- Multi-language support

## License

This project is created for educational and demonstration purposes. 