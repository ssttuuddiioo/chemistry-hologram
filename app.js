console.log('app.js is loading...');
console.log('THREE available:', typeof THREE !== 'undefined');

// Chemistry Elements Data with updated colors
const chemistryElements = [
    { 
        name: "Technology", 
        description: "Cutting-edge technological innovations and digital solutions that drive modern chemistry forward.",
        color: 0x4a4aff,
        url: "/technology"
    },
    { 
        name: "Fabrication", 
        description: "Advanced manufacturing processes and materials engineering for next-generation products.",
        color: 0xd4e157,
        url: "/fabrication"
    },
    { 
        name: "Design", 
        description: "Creative design thinking and aesthetic solutions that merge form with chemical function.",
        color: 0x4a4aff,
        url: "/design"
    },
    { 
        name: "AVL", 
        description: "Analysis, Validation, and Laboratory services ensuring quality and compliance.",
        color: 0xd4e157,
        url: "/avl"
    },
    { 
        name: "About", 
        description: "Our story, mission, and the chemistry that drives our passion for innovation.",
        color: 0x4a4aff,
        url: "/about"
    },
    { 
        name: "Experiential", 
        description: "Immersive experiences that bring chemistry to life through interactive demonstrations.",
        color: 0xd4e157,
        url: "/experiential"
    },
    { 
        name: "Experimental", 
        description: "Research and development laboratory where we push the boundaries of possibility.",
        color: 0x4a4aff,
        url: "/experimental"
    },
    { 
        name: "Community", 
        description: "Building connections and fostering collaboration within the global chemistry community.",
        color: 0xd4e157,
        url: "/community"
    },
    { 
        name: "NYC", 
        description: "Our New York City hub - where urban energy meets chemical innovation.",
        color: 0x4a4aff,
        url: "/nyc"
    },
    { 
        name: "Ethos", 
        description: "Our core values and ethical principles that guide every chemical reaction we create.",
        color: 0xd4e157,
        url: "/ethos"
    },
    { 
        name: "People", 
        description: "The brilliant minds and passionate scientists who make our chemistry possible.",
        color: 0x4a4aff,
        url: "/people"
    }
];

// Global variables
let scene, camera, renderer, controls;
let hexagon, fragments = [];
let raycaster, mouse;
let isExploded = false;
let animationId;
let focusedFragment = null;
let originalCameraPosition = new THREE.Vector3();
let originalControlsTarget = new THREE.Vector3();
let isGravityActive = false;

// Jin Mode variables
let jinParticles = [];
let isJinModeActive = false;

// Hozi Mode variables
let isHoziModeActive = false;
let hexagonEyes = [];
let floatingEyes = [];

// Control parameters
let rotationSpeed = 0.005;
let fragmentSpeed = 0.4;
let hexagonColor = 0x4a4aff;
let lightIntensity = 1;
let wireframeMode = true;
let controlsVisible = true;

// Add debug mode variables
let debugMode = false;
let lightDebugHelpers = [];
let debugActiveTab = 'lights'; // Default active tab

// Initialize the scene
function init() {
    console.log('Initializing scene...');
    
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 15, 80);
        console.log('Scene created');

        // Create camera - positioned straight-on to look into display box
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Set camera position to look straight into the box (no rotation, no movement)
        const cameraDistance = 15;
        camera.position.set(0, 0, cameraDistance); // Centered, straight-on view
        camera.lookAt(0, 0, 0); // Look at the center of the display box
        originalCameraPosition.copy(camera.position);
        console.log('Camera positioned for fixed straight-on view');

        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('container');
        console.log('Container element:', container);
        if (!container) {
            throw new Error('Container element not found!');
        }
        
        container.appendChild(renderer.domElement);
        console.log('Renderer created and added to DOM');

        // Camera stays completely locked - no controls or movement
        console.log('Camera locked in fixed position');

        // Create lights
        createLights();
        console.log('Lights created');

        // Create hexagon
        createHexagon();
        console.log('Hexagon created');

        // Initialize raycaster and mouse
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        console.log('Raycaster and mouse initialized');

        // Add event listeners
        addEventListeners();
        console.log('Event listeners added');
        
        // Create debug controls
        createDebugControls();
        
        // Add debug mode toggle button
        addDebugToggle();
        console.log('Debug controls created');

        // Start animation loop
        animate();
        console.log('Animation loop started');
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

function createLights() {
    // Reduced ambient light to prevent overexposure
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Store reference for ambient light
    window.ambientLight = ambientLight;

    // Main light positioned extremely far behind the camera, but with reduced intensity
    const mainLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.8);
    mainLight.position.set(0, 0, 100); // Keep the distance
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 5;
    mainLight.shadow.camera.far = 120;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0005;
    mainLight.shadow.radius = 8;
    mainLight.target.position.set(0, 0, 0);
    scene.add(mainLight);
    scene.add(mainLight.target);
    
    // Store reference for light intensity updates
    window.mainLight = mainLight;

    // Add a spotlight with reduced intensity
    const spotLight = new THREE.SpotLight(0xffffff, 0.7);
    spotLight.position.set(0, 5, 80);
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 0.3;
    spotLight.decay = 0.5;
    spotLight.distance = 150;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
    
    // Store reference for spotlight
    window.spotLight = spotLight;

    // Fill lights with reduced intensity
    const fillLight1 = new THREE.DirectionalLight(0x4a4aff, 0.2);
    fillLight1.position.set(-20, 5, 60);
    scene.add(fillLight1);
    
    // Store reference for fill light 1
    window.fillLight1 = fillLight1;

    const fillLight2 = new THREE.DirectionalLight(0xd4e157, 0.2);
    fillLight2.position.set(20, 5, 60);
    scene.add(fillLight2);
    
    // Store reference for fill light 2
    window.fillLight2 = fillLight2;
}

function createHexagon() {
    // We're replacing the hexagon with a sphere that has text wrapping around it
    
    // Create a sphere to represent the Universal-style logo
    const sphereGeometry = new THREE.SphereGeometry(3, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x3366cc,
        shininess: 30,
        transparent: false,
        opacity: 1.0,
        emissive: 0x111122,
        emissiveIntensity: 0.1,
        specular: 0x555555
    });
    
    hexagon = new THREE.Mesh(sphereGeometry, sphereMaterial);
    hexagon.castShadow = true;
    hexagon.receiveShadow = true;
    hexagon.userData = { clickable: true, type: 'hexagon' }; // Keep same userData for compatibility
    
    // Position the sphere at the center (explosion point)
    hexagon.position.set(0, 0, 0);
    
    scene.add(hexagon);

    // Create a ring for the text to follow
    const textRadius = 3.1; // Slightly larger than sphere radius
    const textRing = new THREE.Group();
    
    // Create text geometry for "WELCOME TO CHEMISTRY"
    const text = "WELCOME TO CHEMISTRY";
    const fontLoader = new THREE.FontLoader();
    
    // Load font and create 3D text
    // Since we can't load external fonts in this environment, we'll create placeholders 
    // for the text positions around the sphere
    const totalLetters = text.length;
    
    for (let i = 0; i < totalLetters; i++) {
        const angle = (i / totalLetters) * Math.PI * 2;
        const letter = text[i];
        
        // Create a cube as a placeholder for each letter
        const letterGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.1);
        const letterMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xaaaaff,
            emissiveIntensity: 0.5,
            transparent: false, // Ensure letters are not transparent
            opacity: 1.0, // Full opacity
            shininess: 30
        });
        
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        
        // Position letters around the sphere
        letterMesh.position.x = textRadius * Math.sin(angle);
        letterMesh.position.z = textRadius * Math.cos(angle);
        
        // Rotate letters to face outward
        letterMesh.rotation.y = Math.PI - angle;
        
        // Add to ring
        textRing.add(letterMesh);
    }
    
    // Add text ring to scene
    textRing.rotation.x = Math.PI / 10; // Tilt slightly like Universal logo
    scene.add(textRing);
    
    // Store reference to text ring for animation
    window.textRing = textRing;
    
    // Create display box (with only back wall)
    createDisplayBox();
}

function createDisplayBox() {
    const boxGroup = new THREE.Group();
    
    // Box dimensions based on canvas size and aspect ratio (locked on first load)
    const canvasWidth = renderer.domElement.width;
    const canvasHeight = renderer.domElement.height;
    const aspectRatio = canvasWidth / canvasHeight;
    
    // Base the box size on the camera's field of view and distance
    const cameraDistance = 15;
    const fov = camera.fov * (Math.PI / 180); // Convert to radians
    const visibleHeight = 2 * Math.tan(fov / 2) * cameraDistance;
    const visibleWidth = visibleHeight * aspectRatio;
    
    // Box dimensions - make it fill the entire viewport (edges touch window borders)
    const width = visibleWidth; // 100% of visible width
    const height = visibleHeight; // 100% of visible height
    const depth = Math.min(width, height) * 0.5; // Proportional depth
    
    console.log(`Creating back wall: ${width.toFixed(1)} x ${height.toFixed(1)} (aspect: ${aspectRatio.toFixed(2)})`);
    
    // Material for back wall
    const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xf0f0f0,
        transparent: false, // No transparency
        opacity: 1.0, // Full opacity
        side: THREE.DoubleSide
    });
    
    // Back wall (only keeping this part)
    const backWall = new THREE.PlaneGeometry(width, height);
    const backMesh = new THREE.Mesh(backWall, boxMaterial);
    backMesh.position.z = -depth/2;
    backMesh.receiveShadow = true;
    boxGroup.add(backMesh);
    
    // Box stays locked at world origin (0, 0, 0)
    boxGroup.position.set(0, 0, 0);
    scene.add(boxGroup);
    
    // Store reference and dimensions
    window.displayBox = boxGroup;
    window.boxDimensions = { width, height, depth };
}

function createFragments() {
    if (fragments.length > 0) return;

    const numElements = Math.min(chemistryElements.length, 11);
    
    for (let i = 0; i < numElements; i++) {
        const element = chemistryElements[i];
        
        // Create different shaped fragments with more complex geometries
        let geometry;
        const shapeType = i % 6;
        
        switch(shapeType) {
            case 0:
                geometry = new THREE.BoxGeometry(1.2, 1.2, 0.6);
                break;
            case 1:
                geometry = new THREE.SphereGeometry(0.7, 12, 8);
                break;
            case 2:
                geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.0, 8);
                break;
            case 3:
                geometry = new THREE.ConeGeometry(0.7, 1.2, 8);
                break;
            case 4:
                geometry = new THREE.OctahedronGeometry(0.8);
                break;
            case 5:
                geometry = new THREE.TetrahedronGeometry(0.9);
                break;
        }

        const material = new THREE.MeshPhongMaterial({
            color: element.color,
            shininess: 80,
            transparent: false, // Ensure fragments are not transparent
            opacity: 1.0, // Full opacity
            wireframe: false // Always show fill
        });

        const fragment = new THREE.Mesh(geometry, material);
        fragment.castShadow = true;
        fragment.receiveShadow = true;
        
        // START fragments at hexagon center position (0, 0, 0)
        fragment.position.set(0, 0, 0);
        
        // Start fragments smaller and scale them up as they explode
        fragment.scale.set(0.3, 0.3, 0.3);

        // Add random rotation
        fragment.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Store target positions for reference
        const angle = (i / numElements) * Math.PI * 2;
        const radius = 4 + Math.random() * 2;
        
        // Store velocity for animation (will be set during explosion)
        fragment.userData = {
            clickable: true,
            type: 'fragment',
            element: element,
            targetPosition: new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 3
            ),
            velocity: new THREE.Vector3(0, 0, 0), // Start with no velocity
            rotationVelocity: new THREE.Vector3(0, 0, 0), // Start with no rotation
            explosionStartTime: Date.now()
        };

        fragments.push(fragment);
        scene.add(fragment);

        // Add white wireframe outline
        const wireframeGeometry = geometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: false, // No transparency
            opacity: 1.0 // Full opacity
        });
        const wireframeFragment = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        fragment.add(wireframeFragment);
        
        // Animate fragment scale from small to normal
        setTimeout(() => {
            const scaleAnimation = () => {
                if (fragment.scale.x < 1.0) {
                    fragment.scale.multiplyScalar(1.05);
                    requestAnimationFrame(scaleAnimation);
                }
            };
            scaleAnimation();
        }, i * 50); // Stagger the scale animations
    }
}

function explodeHexagon() {
    if (isExploded) return;
    
    isExploded = true;
    
    // Hide the text ring during explosion
    if (window.textRing) {
        window.textRing.visible = false;
    }
    
    // Clean up Hozi mode if active
    if (isHoziModeActive) {
        removeFloatingEyes();
        isHoziModeActive = false;
    }
    
    // Create fragments at sphere position FIRST
    createFragments();
    
    // Start sphere break animation AND fragment explosion simultaneously
    const hexagonTween = {
        scale: { x: 1, y: 1, z: 1 },
        opacity: 0.8
    };
    
    // Start fragment explosion immediately
    setTimeout(() => {
        fragments.forEach((fragment, index) => {
            // Calculate explosion direction from center (where the sphere is)
            const angle = (index / fragments.length) * Math.PI * 2;
            const explosionForce = 0.15 + Math.random() * 0.1;
            
            // Set explosion velocities
            fragment.userData.velocity.set(
                Math.cos(angle) * explosionForce,
                Math.sin(angle) * explosionForce,
                (Math.random() - 0.5) * 0.1
            );
            
            // Add some random rotation velocity for more dynamic effect
            fragment.userData.rotationVelocity.set(
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05
            );
        });
    }, 100); // Small delay to let fragments appear first
    
    const animate = () => {
        hexagonTween.scale.x *= 0.88;
        hexagonTween.scale.y *= 0.88;
        hexagonTween.scale.z *= 0.88;
        hexagonTween.opacity *= 0.85;
        
        hexagon.scale.set(hexagonTween.scale.x, hexagonTween.scale.y, hexagonTween.scale.z);
        hexagon.material.opacity = hexagonTween.opacity;
        
        if (hexagonTween.scale.x > 0.01) {
            requestAnimationFrame(animate);
        } else {
            hexagon.visible = false;
        }
    };
    
    animate();

    // Update button states
    const breakButton = document.getElementById('breakHologram');
    if (breakButton) {
        breakButton.disabled = true;
        breakButton.textContent = 'Hologram Broken';
    }
}

function focusOnFragment(fragment) {
    if (focusedFragment === fragment) return;
    
    focusedFragment = fragment;
    
    // Show element info modal (camera stays completely locked)
    showElementInfoAtPosition(fragment.userData.element, fragment);
}

function returnToOverview() {
    if (!focusedFragment) return;
    
    focusedFragment = null;
    hideElementInfo();
    
    // Camera stays completely locked - no movement
}

function resetScene() {
    isExploded = false;
    focusedFragment = null;
    isGravityActive = false;
    
    // Clean up special modes
    if (isJinModeActive) {
        cleanupJinParticles();
        isJinModeActive = false;
    }
    
    if (isHoziModeActive) {
        removeFloatingEyes();
        isHoziModeActive = false;
    }
    
    // Hide Hozi button
    hideHoziButton();
    
    // Update button states
    const breakButton = document.getElementById('breakHologram');
    if (breakButton) {
        breakButton.disabled = false;
        breakButton.textContent = 'Break Hologram';
    }
    
    // Remove fragments
    fragments.forEach(fragment => {
        scene.remove(fragment);
    });
    fragments = [];
    
    // Reset sphere
    hexagon.visible = true;
    hexagon.position.set(0, 0, 0); // Ensure sphere is at center
    hexagon.scale.set(1, 1, 1);
    hexagon.material.opacity = 1.0;
    hexagon.rotation.set(0, 0, 0); // Reset rotation
    
    // Show text ring again
    if (window.textRing) {
        window.textRing.visible = true;
        window.textRing.rotation.x = Math.PI / 10; // Reset tilt
        window.textRing.rotation.y = 0; // Reset rotation
    }
    
    // Camera will automatically return to rigged position as sphere resets
    
    // Reset focused fragment
    focusedFragment = null;
    
    // Hide element info
    hideElementInfo();
    
    // Show Hozi button since sphere is now complete
    showHoziButton();
}

function toggleControls() {
    controlsVisible = !controlsVisible;
    const controlsPanel = document.getElementById('controls');
    const toggleButton = document.getElementById('controlsToggle');
    
    if (controlsVisible) {
        controlsPanel.classList.remove('hidden');
        toggleButton.classList.remove('controls-hidden');
        toggleButton.textContent = '⚙';
    } else {
        controlsPanel.classList.add('hidden');
        toggleButton.classList.add('controls-hidden');
        toggleButton.textContent = '⚙';
    }
}

function addEventListeners() {
    // Mouse events
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Touch events for mobile
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });
    
    // Keyboard events
    document.addEventListener('keydown', onKeyDown);
    
    // Controls toggle
    document.getElementById('controlsToggle').addEventListener('click', toggleControls);
    
    // Control events
    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        document.getElementById('rotationSpeedValue').textContent = rotationSpeed;
    });
    
    document.getElementById('fragmentSpeed').addEventListener('input', (e) => {
        fragmentSpeed = parseFloat(e.target.value);
        document.getElementById('fragmentSpeedValue').textContent = fragmentSpeed;
        // Update existing fragment velocities
        fragments.forEach(fragment => {
            const vel = fragment.userData.velocity;
            const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
            const newSpeed = 0.03 * fragmentSpeed;
            const scale = speed > 0 ? newSpeed / speed : 1;
            vel.multiplyScalar(scale);
        });
    });
    
    document.getElementById('hexagonColor').addEventListener('input', (e) => {
        hexagonColor = parseInt(e.target.value.replace('#', '0x'));
        if (hexagon) {
            hexagon.material.color.setHex(hexagonColor);
        }
    });
    
    document.getElementById('lightIntensity').addEventListener('input', (e) => {
        lightIntensity = parseFloat(e.target.value);
        document.getElementById('lightIntensityValue').textContent = lightIntensity;
        // Update main directional light
        if (window.mainLight) {
            window.mainLight.intensity = lightIntensity * 0.8;
        }
        // Update spotlight intensity
        if (window.spotLight) {
            window.spotLight.intensity = lightIntensity * 0.7;
        }
    });
    
    document.getElementById('wireframeMode').addEventListener('change', (e) => {
        wireframeMode = e.target.checked;
        updateWireframeMode();
    });
    
    document.getElementById('breakHologram').addEventListener('click', () => {
        if (!isExploded) {
            explodeHexagon();
        }
    });
    
    const resetButton = document.getElementById('resetScene');
    if (resetButton) {
        resetButton.addEventListener('click', resetScene);
    }
    
    // Hozi Mode event listener (Jin Mode removed)
    const hoziButton = document.getElementById('hoziMode');
    if (hoziButton) {
        hoziButton.addEventListener('click', activateHoziMode);
    }
    
    // Manual hexagon rotation controls
    const rotateLeftButton = document.getElementById('rotateLeft');
    const rotateRightButton = document.getElementById('rotateRight');
    
    if (rotateLeftButton) {
        rotateLeftButton.addEventListener('click', () => {
            console.log('Rotate left button clicked');
            rotateHexagonManually(-0.1);
        });
    } else {
        console.error('rotateLeft button not found');
    }
    
    if (rotateRightButton) {
        rotateRightButton.addEventListener('click', () => {
            console.log('Rotate right button clicked');
            rotateHexagonManually(0.1);
        });
    } else {
        console.error('rotateRight button not found');
    }
    
    console.log('Event listeners added successfully');
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function updateWireframeMode() {
    // Update hexagon wireframe visibility
    if (hexagon && hexagon.children.length > 0) {
        hexagon.children[0].visible = wireframeMode;
    }
    
    // Update fragments wireframe visibility
    fragments.forEach(fragment => {
        if (fragment.children.length > 0) {
            fragment.children[0].visible = wireframeMode;
        }
    });
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const clickableObjects = [hexagon, ...fragments].filter(obj => obj.visible && obj.userData.clickable);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        
        if (clicked.userData.type === 'hexagon') {
            explodeHexagon();
        } else if (clicked.userData.type === 'fragment') {
            focusOnFragment(clicked);
        }
    }
}

function onTouchEnd(event) {
    event.preventDefault();
    
    // Only handle single touch
    if (event.changedTouches.length !== 1) return;
    
    const touch = event.changedTouches[0];
    
    // Calculate touch position relative to canvas
    const rect = renderer.domElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Convert to normalized device coordinates
    mouse.x = (x / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(y / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const clickableObjects = [hexagon, ...fragments].filter(obj => obj.visible && obj.userData.clickable);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        
        if (clicked.userData.type === 'hexagon') {
            explodeHexagon();
        } else if (clicked.userData.type === 'fragment') {
            focusOnFragment(clicked);
        }
    }
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Number shortcuts (1-9)
    if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        if (index < chemistryElements.length && isExploded && fragments[index]) {
            focusOnFragment(fragments[index]);
        }
    }
    
    // Reset scene
    if (key === 'r') {
        resetScene();
    }
    
    // Close fragment info modal (instead of camera movement)
    if (key === 'escape') {
        if (focusedFragment) {
            returnToOverview();
        }
    }
    
    // Toggle controls
    if (key === 'h') {
        toggleControls();
    }
    
    // Manual hexagon rotation with arrow keys
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        console.log('Left arrow key pressed');
        rotateHexagonManually(-0.1);
    }
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        console.log('Right arrow key pressed');
        rotateHexagonManually(0.1);
    }
}

function showElementInfoAtPosition(element, fragment) {
    const infoPanel = document.getElementById('elementInfo');
    document.getElementById('elementTitle').textContent = element.name;
    document.getElementById('elementDescription').textContent = element.description;
    
    const button = document.getElementById('elementButton');
    button.onclick = () => {
        window.open(element.url, '_blank');
    };
    
    // Position info panel next to fragment in screen space
    const fragmentScreenPosition = new THREE.Vector3();
    fragmentScreenPosition.copy(fragment.position);
    fragmentScreenPosition.project(camera);
    
    const x = (fragmentScreenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (fragmentScreenPosition.y * -0.5 + 0.5) * window.innerHeight;
    
    // Position with some offset and ensure it stays on screen
    let finalX = x + 50;
    let finalY = y - 100;
    
    if (finalX + 300 > window.innerWidth) finalX = x - 350;
    if (finalY < 50) finalY = y + 50;
    if (finalY + 200 > window.innerHeight) finalY = window.innerHeight - 250;
    
    infoPanel.style.left = finalX + 'px';
    infoPanel.style.top = finalY + 'px';
    infoPanel.classList.add('visible');
}

function hideElementInfo() {
    document.getElementById('elementInfo').classList.remove('visible');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Display box stays locked - no resizing
    console.log('Window resized - display box stays locked');
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Rotate sphere slowly
    if (hexagon && hexagon.visible) {
        hexagon.rotation.y += rotationSpeed * 0.5; // Slower rotation for sphere
    }
    
    // Rotate the text ring (in opposite direction for dramatic effect)
    if (window.textRing) {
        window.textRing.rotation.y -= rotationSpeed * 0.3;
    }
    
    // Animate fragments
    fragments.forEach(fragment => {
        if (fragment.visible && fragment !== focusedFragment) {
            // Apply velocity
            fragment.position.add(fragment.userData.velocity);
            
            // Apply rotation
            fragment.rotation.x += fragment.userData.rotationVelocity.x;
            fragment.rotation.y += fragment.userData.rotationVelocity.y;
            fragment.rotation.z += fragment.userData.rotationVelocity.z;
            
            // Bounce off boundaries (within the display box)
            const boundary = 8;
            if (Math.abs(fragment.position.x) > boundary) {
                fragment.userData.velocity.x *= -0.7;
                fragment.position.x = Math.sign(fragment.position.x) * boundary;
            }
            if (Math.abs(fragment.position.y) > boundary) {
                fragment.userData.velocity.y *= -0.7;
                fragment.position.y = Math.sign(fragment.position.y) * boundary;
            }
            if (Math.abs(fragment.position.z) > boundary) {
                fragment.userData.velocity.z *= -0.7;
                fragment.position.z = Math.sign(fragment.position.z) * boundary;
            }
            
            // Apply slight damping
            fragment.userData.velocity.multiplyScalar(0.997);
        }
    });
    
    // Animate Jin Mode particles
    if (isJinModeActive && jinParticles.length > 0) {
        jinParticles.forEach(particle => {
            // Apply velocity
            particle.position.add(particle.userData.velocity);
            
            // Apply rotation
            particle.rotation.x += particle.userData.rotationVelocity.x;
            particle.rotation.y += particle.userData.rotationVelocity.y;
            particle.rotation.z += particle.userData.rotationVelocity.z;
            
            // Bounce off boundaries (same as fragments)
            const boundary = 8;
            if (Math.abs(particle.position.x) > boundary) {
                particle.userData.velocity.x *= -0.7;
                particle.position.x = Math.sign(particle.position.x) * boundary;
            }
            if (Math.abs(particle.position.y) > boundary) {
                particle.userData.velocity.y *= -0.7;
                particle.position.y = Math.sign(particle.position.y) * boundary;
            }
            if (Math.abs(particle.position.z) > boundary) {
                particle.userData.velocity.z *= -0.7;
                particle.position.z = Math.sign(particle.position.z) * boundary;
            }
            
            // Apply slight damping
            particle.userData.velocity.multiplyScalar(0.997);
        });
    }
    
    // Update info panel position if focused on fragment
    if (focusedFragment) {
        showElementInfoAtPosition(focusedFragment.userData.element, focusedFragment);
    }
    
    // Update light helpers if debug mode is active
    if (debugMode && lightDebugHelpers.length > 0) {
        lightDebugHelpers.forEach(helper => {
            helper.update();
        });
    }
    
    // Render
    renderer.render(scene, camera);
}

function gravityPull() {
    if (!isExploded || isGravityActive) return;
    
    isGravityActive = true;
    
    // Update button states
    const gravityButton = document.getElementById('gravityPull');
    const breakButton = document.getElementById('breakHologram');
    gravityButton.disabled = true;
    gravityButton.textContent = 'Gravity Active';
    
    // Return to overview if focused on a fragment
    if (focusedFragment) {
        returnToOverview();
    }
    
    // Animate fragments back to center
    fragments.forEach((fragment, index) => {
        // Calculate attraction force towards center
        const attractionStrength = 0.05;
        
        // Set up gravity animation
        const animateToCenter = () => {
            if (!isGravityActive) return;
            
            // Calculate direction to center
            const directionToCenter = new THREE.Vector3(0, 0, 0).sub(fragment.position);
            const distance = directionToCenter.length();
            
            if (distance > 0.1) {
                // Apply gravity force
                directionToCenter.normalize();
                fragment.userData.velocity.add(directionToCenter.multiplyScalar(attractionStrength));
                
                // Apply some damping to prevent overshoot
                fragment.userData.velocity.multiplyScalar(0.95);
                
                // Update position
                fragment.position.add(fragment.userData.velocity);
                
                // Slow down rotation as fragments approach center
                fragment.userData.rotationVelocity.multiplyScalar(0.98);
                
                // Scale down fragments as they approach center
                const scaleTarget = Math.max(0.1, distance / 10);
                fragment.scale.multiplyScalar(0.99);
                
                requestAnimationFrame(animateToCenter);
            } else {
                // Fragment has reached center, make it disappear
                fragment.visible = false;
                
                // Check if all fragments are at center
                const allAtCenter = fragments.every(frag => !frag.visible || frag.position.length() < 0.1);
                if (allAtCenter) {
                    reformHexagon();
                }
            }
        };
        
        // Start animation with slight delay for staggered effect
        setTimeout(() => {
            animateToCenter();
        }, index * 100);
    });
}

function reformHexagon() {
    // Make hexagon visible and animate it growing back
    hexagon.visible = true;
    hexagon.scale.set(0.1, 0.1, 0.1);
    hexagon.material.opacity = 0.1;
    
    const reformAnimation = () => {
        if (hexagon.scale.x < 1.0) {
            hexagon.scale.multiplyScalar(1.08);
            hexagon.material.opacity += 0.05;
            requestAnimationFrame(reformAnimation);
        } else {
            // Reset everything to normal state
            hexagon.scale.set(1, 1, 1);
            hexagon.material.opacity = 1.0;
            
            // Clean up fragments
            fragments.forEach(fragment => {
                scene.remove(fragment);
            });
            fragments = [];
            
            // Reset states
            isExploded = false;
            isGravityActive = false;
            
            // Update button states
            const gravityButton = document.getElementById('gravityPull');
            const breakButton = document.getElementById('breakHologram');
            
            gravityButton.disabled = true;
            gravityButton.textContent = 'Gravity Pull';
            breakButton.disabled = false;
            breakButton.textContent = 'Break Hologram';
        }
    };
    
    reformAnimation();
}

function activateJinMode() {
    console.log('Jin Mode activated!');
    if (isJinModeActive) return;
    
    isJinModeActive = true;
    
    // Create 1000 particles
    for (let i = 0; i < 1000; i++) {
        const geometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.05, 6, 6);
        
        // Random bright colors
        const colors = [0xff6b6b, 0xffd93d, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        // Start particles at center
        particle.position.set(0, 0, 0);
        
        // Random explosion velocity (smaller for floating effect)
        const explosionForce = 0.1 + Math.random() * 0.2;
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        
        particle.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle1) * Math.sin(angle2) * explosionForce,
                Math.sin(angle1) * Math.sin(angle2) * explosionForce,
                Math.cos(angle2) * explosionForce
            ),
            rotationVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        };
        
        jinParticles.push(particle);
        scene.add(particle);
    }
}

function cleanupJinParticles() {
    jinParticles.forEach(particle => {
        scene.remove(particle);
    });
    jinParticles = [];
}

function showHoziButton() {
    const hoziButton = document.getElementById('hoziMode');
    hoziButton.style.display = 'block';
}

function hideHoziButton() {
    const hoziButton = document.getElementById('hoziMode');
    hoziButton.style.display = 'none';
}

function activateHoziMode() {
    console.log('Hozi Mode activated!');
    if (isHoziModeActive) return;
    
    isHoziModeActive = true;
    
    // Add 3 floating eye emojis to the screen
    for (let i = 0; i < 3; i++) {
        const eyeDiv = document.createElement('div');
        eyeDiv.className = 'floating-eye';
        eyeDiv.textContent = '👁️';
        
        // Random positions on screen
        const x = 20 + Math.random() * (window.innerWidth - 100);
        const y = 20 + Math.random() * (window.innerHeight - 100);
        
        eyeDiv.style.left = x + 'px';
        eyeDiv.style.top = y + 'px';
        eyeDiv.style.animationDelay = (i * 0.5) + 's';
        
        document.body.appendChild(eyeDiv);
        floatingEyes.push(eyeDiv);
    }
    
    // Remove eyes after 10 seconds
    setTimeout(() => {
        removeFloatingEyes();
        isHoziModeActive = false;
    }, 10000);
}

function removeFloatingEyes() {
    floatingEyes.forEach(eye => {
        document.body.removeChild(eye);
    });
    floatingEyes = [];
}

// Manual hexagon rotation function
function rotateHexagonManually(angle) {
    console.log('rotateHexagonManually called with angle:', angle);
    console.log('hexagon exists:', !!hexagon);
    console.log('hexagon visible:', hexagon ? hexagon.visible : 'N/A');
    
    if (hexagon && hexagon.visible) {
        const oldRotation = hexagon.rotation.y;
        hexagon.rotation.y += angle;
        console.log('Hexagon rotation changed from', oldRotation, 'to', hexagon.rotation.y);
    } else {
        console.log('Cannot rotate: hexagon not available or not visible');
    }
}

// Add debug controls function
function createDebugControls() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.background = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.display = debugMode ? 'block' : 'none';
    debugPanel.style.width = '300px';
    debugPanel.style.maxHeight = '85vh';
    debugPanel.style.overflowY = 'auto';
    
    // Add tabs for different control sections
    let html = '<div class="debug-tabs" style="display: flex; margin-bottom: 15px;">';
    html += '<div id="tab-lights" class="debug-tab" style="flex: 1; text-align: center; padding: 8px; background: ' + (debugActiveTab === 'lights' ? '#4a4aff' : '#333') + '; cursor: pointer; border-radius: 3px 0 0 3px;">Lights</div>';
    html += '<div id="tab-sphere" class="debug-tab" style="flex: 1; text-align: center; padding: 8px; background: ' + (debugActiveTab === 'sphere' ? '#4a4aff' : '#333') + '; cursor: pointer;">Sphere</div>';
    html += '<div id="tab-camera" class="debug-tab" style="flex: 1; text-align: center; padding: 8px; background: ' + (debugActiveTab === 'camera' ? '#4a4aff' : '#333') + '; cursor: pointer;">Camera</div>';
    html += '<div id="tab-scene" class="debug-tab" style="flex: 1; text-align: center; padding: 8px; background: ' + (debugActiveTab === 'scene' ? '#4a4aff' : '#333') + '; cursor: pointer; border-radius: 0 3px 3px 0;">Scene</div>';
    html += '</div>';
    
    // LIGHTS TAB
    html += '<div id="lights-panel" class="debug-panel" style="display: ' + (debugActiveTab === 'lights' ? 'block' : 'none') + ';">';
    html += '<h3 style="margin: 0 0 10px 0; color: #4a4aff;">Light Controls</h3>';
    
    // Main Light controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Main Light</h4>';
    
    html += '<label>X Position: <span id="mainLightX">0</span></label><br>';
    html += '<input type="range" id="mainLightXControl" min="-100" max="100" value="0" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="mainLightY">0</span></label><br>';
    html += '<input type="range" id="mainLightYControl" min="-100" max="100" value="5" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="mainLightZ">100</span></label><br>';
    html += '<input type="range" id="mainLightZControl" min="-100" max="200" value="100" style="width: 100%"><br>';
    
    html += '<label>Intensity: <span id="mainLightIntensity">0.8</span></label><br>';
    html += '<input type="range" id="mainLightIntensityControl" min="0" max="5" step="0.1" value="0.8" style="width: 100%"><br>';
    html += '</div>';
    
    // Spotlight controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Spotlight</h4>';
    
    html += '<label>X Position: <span id="spotLightX">0</span></label><br>';
    html += '<input type="range" id="spotLightXControl" min="-100" max="100" value="0" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="spotLightY">5</span></label><br>';
    html += '<input type="range" id="spotLightYControl" min="-100" max="100" value="5" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="spotLightZ">80</span></label><br>';
    html += '<input type="range" id="spotLightZControl" min="-100" max="200" value="80" style="width: 100%"><br>';
    
    html += '<label>Intensity: <span id="spotLightIntensity">0.7</span></label><br>';
    html += '<input type="range" id="spotLightIntensityControl" min="0" max="5" step="0.1" value="0.7" style="width: 100%"><br>';
    
    html += '<label>Angle: <span id="spotLightAngle">' + (Math.PI/8).toFixed(2) + '</span></label><br>';
    html += '<input type="range" id="spotLightAngleControl" min="0.1" max="1.5" step="0.05" value="' + (Math.PI/8) + '" style="width: 100%"><br>';
    
    html += '<label>Penumbra: <span id="spotLightPenumbra">0.3</span></label><br>';
    html += '<input type="range" id="spotLightPenumbraControl" min="0" max="1" step="0.05" value="0.3" style="width: 100%"><br>';
    html += '</div>';
    
    // Fill Light 1 controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Fill Light 1 (Blue)</h4>';
    
    html += '<label>X Position: <span id="fillLight1X">-20</span></label><br>';
    html += '<input type="range" id="fillLight1XControl" min="-100" max="100" value="-20" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="fillLight1Y">5</span></label><br>';
    html += '<input type="range" id="fillLight1YControl" min="-100" max="100" value="5" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="fillLight1Z">60</span></label><br>';
    html += '<input type="range" id="fillLight1ZControl" min="-100" max="200" value="60" style="width: 100%"><br>';
    
    html += '<label>Intensity: <span id="fillLight1Intensity">0.2</span></label><br>';
    html += '<input type="range" id="fillLight1IntensityControl" min="0" max="2" step="0.1" value="0.2" style="width: 100%"><br>';
    html += '</div>';
    
    // Fill Light 2 controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Fill Light 2 (Green)</h4>';
    
    html += '<label>X Position: <span id="fillLight2X">20</span></label><br>';
    html += '<input type="range" id="fillLight2XControl" min="-100" max="100" value="20" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="fillLight2Y">5</span></label><br>';
    html += '<input type="range" id="fillLight2YControl" min="-100" max="100" value="5" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="fillLight2Z">60</span></label><br>';
    html += '<input type="range" id="fillLight2ZControl" min="-100" max="200" value="60" style="width: 100%"><br>';
    
    html += '<label>Intensity: <span id="fillLight2Intensity">0.2</span></label><br>';
    html += '<input type="range" id="fillLight2IntensityControl" min="0" max="2" step="0.1" value="0.2" style="width: 100%"><br>';
    html += '</div>';
    
    // Ambient Light controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Ambient Light</h4>';
    
    html += '<label>Intensity: <span id="ambientLightIntensity">0.2</span></label><br>';
    html += '<input type="range" id="ambientLightIntensityControl" min="0" max="1" step="0.05" value="0.2" style="width: 100%"><br>';
    html += '</div>';
    
    // Helper visibility control
    html += '<div style="margin-bottom: 15px;">';
    html += '<label><input type="checkbox" id="showLightHelpers"> Show Light Helpers</label>';
    html += '</div>';
    
    // Export button
    html += '<button id="exportLightSettings" style="width: 100%; padding: 8px; background: #4a4aff; color: white; border: none; border-radius: 4px; cursor: pointer;">Export Light Settings</button>';
    html += '</div>'; // End of Lights Tab
    
    // SPHERE TAB
    html += '<div id="sphere-panel" class="debug-panel" style="display: ' + (debugActiveTab === 'sphere' ? 'block' : 'none') + ';">';
    html += '<h3 style="margin: 0 0 10px 0; color: #4a4aff;">Sphere Controls</h3>';
    
    // Sphere Position
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Position</h4>';
    
    html += '<label>X Position: <span id="sphereX">0</span></label><br>';
    html += '<input type="range" id="sphereXControl" min="-10" max="10" step="0.1" value="0" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="sphereY">0</span></label><br>';
    html += '<input type="range" id="sphereYControl" min="-10" max="10" step="0.1" value="0" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="sphereZ">0</span></label><br>';
    html += '<input type="range" id="sphereZControl" min="-10" max="10" step="0.1" value="0" style="width: 100%"><br>';
    html += '</div>';
    
    // Sphere Material
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Material</h4>';
    
    html += '<label>Color: </label>';
    html += '<input type="color" id="sphereColorControl" value="#3366cc" style="width: 100%"><br><br>';
    
    html += '<label>Shininess: <span id="sphereShininess">30</span></label><br>';
    html += '<input type="range" id="sphereShininessControl" min="0" max="200" value="30" style="width: 100%"><br>';
    
    html += '<label>Emissive Intensity: <span id="sphereEmissiveIntensity">0.1</span></label><br>';
    html += '<input type="range" id="sphereEmissiveIntensityControl" min="0" max="1" step="0.05" value="0.1" style="width: 100%"><br>';
    
    html += '<label>Emissive Color: </label>';
    html += '<input type="color" id="sphereEmissiveColorControl" value="#111122" style="width: 100%"><br>';
    html += '</div>';
    
    // Sphere Size & Rotation
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Size & Rotation</h4>';
    
    html += '<label>Radius: <span id="sphereRadius">3</span></label><br>';
    html += '<input type="range" id="sphereRadiusControl" min="0.5" max="10" step="0.1" value="3" style="width: 100%"><br>';
    
    html += '<label>Rotation Speed: <span id="sphereRotationSpeed">' + rotationSpeed + '</span></label><br>';
    html += '<input type="range" id="sphereRotationSpeedControl" min="0" max="0.05" step="0.001" value="' + rotationSpeed + '" style="width: 100%"><br>';
    html += '</div>';
    
    // Text Ring
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Text Ring</h4>';
    
    html += '<label>Text Radius: <span id="textRadius">3.1</span></label><br>';
    html += '<input type="range" id="textRadiusControl" min="2.5" max="10" step="0.1" value="3.1" style="width: 100%"><br>';
    
    html += '<label>Text Tilt: <span id="textTilt">' + (Math.PI/10).toFixed(2) + '</span></label><br>';
    html += '<input type="range" id="textTiltControl" min="0" max="1.57" step="0.05" value="' + (Math.PI/10) + '" style="width: 100%"><br>';
    
    html += '<label>Text Color: </label>';
    html += '<input type="color" id="textColorControl" value="#ffffff" style="width: 100%"><br>';
    
    html += '<label>Text Emissive: </label>';
    html += '<input type="color" id="textEmissiveColorControl" value="#aaaaff" style="width: 100%"><br>';
    html += '</div>';
    html += '</div>'; // End of Sphere Tab
    
    // CAMERA TAB
    html += '<div id="camera-panel" class="debug-panel" style="display: ' + (debugActiveTab === 'camera' ? 'block' : 'none') + ';">';
    html += '<h3 style="margin: 0 0 10px 0; color: #4a4aff;">Camera Controls</h3>';
    
    // Camera Position
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Position</h4>';
    
    html += '<label>X Position: <span id="cameraX">0</span></label><br>';
    html += '<input type="range" id="cameraXControl" min="-30" max="30" value="0" style="width: 100%"><br>';
    
    html += '<label>Y Position: <span id="cameraY">0</span></label><br>';
    html += '<input type="range" id="cameraYControl" min="-30" max="30" value="0" style="width: 100%"><br>';
    
    html += '<label>Z Position: <span id="cameraZ">15</span></label><br>';
    html += '<input type="range" id="cameraZControl" min="3" max="50" value="15" style="width: 100%"><br>';
    html += '</div>';
    
    // Camera Field of View
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Field of View</h4>';
    
    html += '<label>FOV: <span id="cameraFOV">75</span></label><br>';
    html += '<input type="range" id="cameraFOVControl" min="20" max="120" value="75" style="width: 100%"><br>';
    html += '</div>';
    
    // Camera Look At
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Look At</h4>';
    
    html += '<label>Target X: <span id="cameraTargetX">0</span></label><br>';
    html += '<input type="range" id="cameraTargetXControl" min="-10" max="10" value="0" style="width: 100%"><br>';
    
    html += '<label>Target Y: <span id="cameraTargetY">0</span></label><br>';
    html += '<input type="range" id="cameraTargetYControl" min="-10" max="10" value="0" style="width: 100%"><br>';
    
    html += '<label>Target Z: <span id="cameraTargetZ">0</span></label><br>';
    html += '<input type="range" id="cameraTargetZControl" min="-10" max="10" value="0" style="width: 100%"><br>';
    html += '</div>';
    
    // Reset Camera Button
    html += '<button id="resetCamera" style="width: 100%; padding: 8px; background: #4a4aff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px;">Reset Camera</button>';
    html += '</div>'; // End of Camera Tab
    
    // SCENE TAB
    html += '<div id="scene-panel" class="debug-panel" style="display: ' + (debugActiveTab === 'scene' ? 'block' : 'none') + ';">';
    html += '<h3 style="margin: 0 0 10px 0; color: #4a4aff;">Scene Controls</h3>';
    
    // Background Color
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Background</h4>';
    
    html += '<label>Background Color: </label>';
    html += '<input type="color" id="backgroundColorControl" value="#ffffff" style="width: 100%"><br>';
    
    html += '<label>Background Opacity: <span id="backgroundOpacity">0</span></label><br>';
    html += '<input type="range" id="backgroundOpacityControl" min="0" max="1" step="0.05" value="0" style="width: 100%"><br>';
    html += '</div>';
    
    // Fog Controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Fog</h4>';
    
    html += '<label><input type="checkbox" id="fogEnabledControl" checked> Enable Fog</label><br><br>';
    
    html += '<label>Fog Color: </label>';
    html += '<input type="color" id="fogColorControl" value="#ffffff" style="width: 100%"><br><br>';
    
    html += '<label>Fog Near: <span id="fogNear">15</span></label><br>';
    html += '<input type="range" id="fogNearControl" min="0" max="50" value="15" style="width: 100%"><br>';
    
    html += '<label>Fog Far: <span id="fogFar">80</span></label><br>';
    html += '<input type="range" id="fogFarControl" min="20" max="200" value="80" style="width: 100%"><br>';
    html += '</div>';
    
    // Back wall
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Back Wall</h4>';
    
    html += '<label>Wall Color: </label>';
    html += '<input type="color" id="wallColorControl" value="#f0f0f0" style="width: 100%"><br><br>';
    
    html += '<label>Wall Distance: <span id="wallDistance">0</span></label><br>';
    html += '<input type="range" id="wallDistanceControl" min="-20" max="0" step="0.5" value="-5" style="width: 100%"><br>';
    html += '</div>';
    
    // Fragment Controls
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Fragments</h4>';
    
    html += '<label>Fragment Speed: <span id="fragmentSpeedValue">' + fragmentSpeed + '</span></label><br>';
    html += '<input type="range" id="fragmentSpeedDebugControl" min="0.1" max="2" step="0.05" value="' + fragmentSpeed + '" style="width: 100%"><br>';
    
    html += '<label>Explosion Radius: <span id="explosionRadiusValue">4</span></label><br>';
    html += '<input type="range" id="explosionRadiusControl" min="2" max="10" step="0.5" value="4" style="width: 100%"><br>';
    html += '</div>';
    
    // Shadow Quality
    html += '<div style="margin-bottom: 15px;">';
    html += '<h4 style="margin: 0 0 5px 0; color: #d4e157;">Shadow Quality</h4>';
    
    html += '<label><input type="checkbox" id="shadowsEnabledControl" checked> Enable Shadows</label><br><br>';
    
    html += '<label>Shadow Map Size: </label><br>';
    html += '<select id="shadowMapSizeControl" style="width: 100%; padding: 5px;">';
    html += '<option value="512">Low (512)</option>';
    html += '<option value="1024">Medium (1024)</option>';
    html += '<option value="2048" selected>High (2048)</option>';
    html += '<option value="4096">Ultra (4096)</option>';
    html += '</select><br><br>';
    
    html += '<label>Shadow Type: </label><br>';
    html += '<select id="shadowTypeControl" style="width: 100%; padding: 5px;">';
    html += '<option value="basic">Basic</option>';
    html += '<option value="pcf" selected>PCF</option>';
    html += '<option value="pcfsoft">PCF Soft</option>';
    html += '<option value="vsm">VSM</option>';
    html += '</select>';
    html += '</div>';
    html += '</div>'; // End of Scene Tab
    
    debugPanel.innerHTML = html;
    document.body.appendChild(debugPanel);
    
    // Add event listeners to all the controls and tabs
    setupDebugControlEvents();
}

// Setup debug control event listeners
function setupDebugControlEvents() {
    // Tab switching
    document.getElementById('tab-lights').addEventListener('click', () => switchDebugTab('lights'));
    document.getElementById('tab-sphere').addEventListener('click', () => switchDebugTab('sphere'));
    document.getElementById('tab-camera').addEventListener('click', () => switchDebugTab('camera'));
    document.getElementById('tab-scene').addEventListener('click', () => switchDebugTab('scene'));
    
    // ---- LIGHTS TAB ----
    // Main Light controls
    document.getElementById('mainLightXControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('mainLightYControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('mainLightZControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('mainLightIntensityControl').addEventListener('input', updateLightFromDebugControls);
    
    // Spotlight controls
    document.getElementById('spotLightXControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('spotLightYControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('spotLightZControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('spotLightIntensityControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('spotLightAngleControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('spotLightPenumbraControl').addEventListener('input', updateLightFromDebugControls);
    
    // Fill Light 1 controls
    document.getElementById('fillLight1XControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight1YControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight1ZControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight1IntensityControl').addEventListener('input', updateLightFromDebugControls);
    
    // Fill Light 2 controls
    document.getElementById('fillLight2XControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight2YControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight2ZControl').addEventListener('input', updateLightFromDebugControls);
    document.getElementById('fillLight2IntensityControl').addEventListener('input', updateLightFromDebugControls);
    
    // Ambient Light control
    document.getElementById('ambientLightIntensityControl').addEventListener('input', updateLightFromDebugControls);
    
    // Light helper toggle
    document.getElementById('showLightHelpers').addEventListener('change', toggleLightHelpers);
    
    // Export button
    document.getElementById('exportLightSettings').addEventListener('click', exportLightSettings);
    
    // ---- SPHERE TAB ----
    // Sphere position
    document.getElementById('sphereXControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereYControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereZControl').addEventListener('input', updateSphereFromDebugControls);
    
    // Sphere material
    document.getElementById('sphereColorControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereShininessControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereEmissiveIntensityControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereEmissiveColorControl').addEventListener('input', updateSphereFromDebugControls);
    
    // Sphere size & rotation
    document.getElementById('sphereRadiusControl').addEventListener('input', updateSphereFromDebugControls);
    document.getElementById('sphereRotationSpeedControl').addEventListener('input', updateSphereFromDebugControls);
    
    // Text ring
    document.getElementById('textRadiusControl').addEventListener('input', updateTextRingFromDebugControls);
    document.getElementById('textTiltControl').addEventListener('input', updateTextRingFromDebugControls);
    document.getElementById('textColorControl').addEventListener('input', updateTextRingFromDebugControls);
    document.getElementById('textEmissiveColorControl').addEventListener('input', updateTextRingFromDebugControls);
    
    // ---- CAMERA TAB ----
    // Camera position
    document.getElementById('cameraXControl').addEventListener('input', updateCameraFromDebugControls);
    document.getElementById('cameraYControl').addEventListener('input', updateCameraFromDebugControls);
    document.getElementById('cameraZControl').addEventListener('input', updateCameraFromDebugControls);
    
    // Camera FOV
    document.getElementById('cameraFOVControl').addEventListener('input', updateCameraFromDebugControls);
    
    // Camera look at
    document.getElementById('cameraTargetXControl').addEventListener('input', updateCameraFromDebugControls);
    document.getElementById('cameraTargetYControl').addEventListener('input', updateCameraFromDebugControls);
    document.getElementById('cameraTargetZControl').addEventListener('input', updateCameraFromDebugControls);
    
    // Reset camera
    document.getElementById('resetCamera').addEventListener('click', resetCameraFromDebugControls);
    
    // ---- SCENE TAB ----
    // Background
    document.getElementById('backgroundColorControl').addEventListener('input', updateSceneFromDebugControls);
    document.getElementById('backgroundOpacityControl').addEventListener('input', updateSceneFromDebugControls);
    
    // Fog
    document.getElementById('fogEnabledControl').addEventListener('change', updateSceneFromDebugControls);
    document.getElementById('fogColorControl').addEventListener('input', updateSceneFromDebugControls);
    document.getElementById('fogNearControl').addEventListener('input', updateSceneFromDebugControls);
    document.getElementById('fogFarControl').addEventListener('input', updateSceneFromDebugControls);
    
    // Back wall
    document.getElementById('wallColorControl').addEventListener('input', updateSceneFromDebugControls);
    document.getElementById('wallDistanceControl').addEventListener('input', updateSceneFromDebugControls);
    
    // Fragments
    document.getElementById('fragmentSpeedDebugControl').addEventListener('input', updateSceneFromDebugControls);
    document.getElementById('explosionRadiusControl').addEventListener('input', updateSceneFromDebugControls);
    
    // Shadow quality
    document.getElementById('shadowsEnabledControl').addEventListener('change', updateSceneFromDebugControls);
    document.getElementById('shadowMapSizeControl').addEventListener('change', updateSceneFromDebugControls);
    document.getElementById('shadowTypeControl').addEventListener('change', updateSceneFromDebugControls);
}

// Update lights based on debug controls
function updateLightFromDebugControls() {
    // Main Light
    const mainLightX = parseFloat(document.getElementById('mainLightXControl').value);
    const mainLightY = parseFloat(document.getElementById('mainLightYControl').value);
    const mainLightZ = parseFloat(document.getElementById('mainLightZControl').value);
    const mainLightIntensity = parseFloat(document.getElementById('mainLightIntensityControl').value);
    
    window.mainLight.position.set(mainLightX, mainLightY, mainLightZ);
    window.mainLight.intensity = mainLightIntensity;
    
    document.getElementById('mainLightX').textContent = mainLightX;
    document.getElementById('mainLightY').textContent = mainLightY;
    document.getElementById('mainLightZ').textContent = mainLightZ;
    document.getElementById('mainLightIntensity').textContent = mainLightIntensity;
    
    // Spotlight
    const spotLightX = parseFloat(document.getElementById('spotLightXControl').value);
    const spotLightY = parseFloat(document.getElementById('spotLightYControl').value);
    const spotLightZ = parseFloat(document.getElementById('spotLightZControl').value);
    const spotLightIntensity = parseFloat(document.getElementById('spotLightIntensityControl').value);
    const spotLightAngle = parseFloat(document.getElementById('spotLightAngleControl').value);
    const spotLightPenumbra = parseFloat(document.getElementById('spotLightPenumbraControl').value);
    
    window.spotLight.position.set(spotLightX, spotLightY, spotLightZ);
    window.spotLight.intensity = spotLightIntensity;
    window.spotLight.angle = spotLightAngle;
    window.spotLight.penumbra = spotLightPenumbra;
    
    document.getElementById('spotLightX').textContent = spotLightX;
    document.getElementById('spotLightY').textContent = spotLightY;
    document.getElementById('spotLightZ').textContent = spotLightZ;
    document.getElementById('spotLightIntensity').textContent = spotLightIntensity;
    document.getElementById('spotLightAngle').textContent = spotLightAngle.toFixed(2);
    document.getElementById('spotLightPenumbra').textContent = spotLightPenumbra.toFixed(2);
    
    // Fill Light 1
    const fillLight1X = parseFloat(document.getElementById('fillLight1XControl').value);
    const fillLight1Y = parseFloat(document.getElementById('fillLight1YControl').value);
    const fillLight1Z = parseFloat(document.getElementById('fillLight1ZControl').value);
    const fillLight1Intensity = parseFloat(document.getElementById('fillLight1IntensityControl').value);
    
    window.fillLight1.position.set(fillLight1X, fillLight1Y, fillLight1Z);
    window.fillLight1.intensity = fillLight1Intensity;
    
    document.getElementById('fillLight1X').textContent = fillLight1X;
    document.getElementById('fillLight1Y').textContent = fillLight1Y;
    document.getElementById('fillLight1Z').textContent = fillLight1Z;
    document.getElementById('fillLight1Intensity').textContent = fillLight1Intensity;
    
    // Fill Light 2
    const fillLight2X = parseFloat(document.getElementById('fillLight2XControl').value);
    const fillLight2Y = parseFloat(document.getElementById('fillLight2YControl').value);
    const fillLight2Z = parseFloat(document.getElementById('fillLight2ZControl').value);
    const fillLight2Intensity = parseFloat(document.getElementById('fillLight2IntensityControl').value);
    
    window.fillLight2.position.set(fillLight2X, fillLight2Y, fillLight2Z);
    window.fillLight2.intensity = fillLight2Intensity;
    
    document.getElementById('fillLight2X').textContent = fillLight2X;
    document.getElementById('fillLight2Y').textContent = fillLight2Y;
    document.getElementById('fillLight2Z').textContent = fillLight2Z;
    document.getElementById('fillLight2Intensity').textContent = fillLight2Intensity;
    
    // Ambient Light
    const ambientLightIntensity = parseFloat(document.getElementById('ambientLightIntensityControl').value);
    window.ambientLight.intensity = ambientLightIntensity;
    document.getElementById('ambientLightIntensity').textContent = ambientLightIntensity;
    
    // Update light helpers if visible
    updateLightHelpers();
}

// Update sphere from debug controls
function updateSphereFromDebugControls() {
    if (!hexagon) return;
    
    // Sphere position
    const sphereX = parseFloat(document.getElementById('sphereXControl').value);
    const sphereY = parseFloat(document.getElementById('sphereYControl').value);
    const sphereZ = parseFloat(document.getElementById('sphereZControl').value);
    
    hexagon.position.set(sphereX, sphereY, sphereZ);
    
    document.getElementById('sphereX').textContent = sphereX;
    document.getElementById('sphereY').textContent = sphereY;
    document.getElementById('sphereZ').textContent = sphereZ;
    
    // Sphere material
    const sphereColor = document.getElementById('sphereColorControl').value;
    const sphereShininess = parseFloat(document.getElementById('sphereShininessControl').value);
    const sphereEmissiveIntensity = parseFloat(document.getElementById('sphereEmissiveIntensityControl').value);
    const sphereEmissiveColor = document.getElementById('sphereEmissiveColorControl').value;
    
    hexagon.material.color.set(sphereColor);
    hexagon.material.shininess = sphereShininess;
    hexagon.material.emissiveIntensity = sphereEmissiveIntensity;
    hexagon.material.emissive.set(sphereEmissiveColor);
    
    document.getElementById('sphereShininess').textContent = sphereShininess;
    document.getElementById('sphereEmissiveIntensity').textContent = sphereEmissiveIntensity;
    
    // Sphere size & rotation
    const sphereRadius = parseFloat(document.getElementById('sphereRadiusControl').value);
    rotationSpeed = parseFloat(document.getElementById('sphereRotationSpeedControl').value);
    
    // We need to recreate the geometry since sphere radius can't be directly changed
    if (Math.abs(hexagon.geometry.parameters.radius - sphereRadius) > 0.01) {
        const newGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
        hexagon.geometry.dispose();
        hexagon.geometry = newGeometry;
    }
    
    document.getElementById('sphereRadius').textContent = sphereRadius;
    document.getElementById('sphereRotationSpeed').textContent = rotationSpeed.toFixed(3);
}

// Update text ring from debug controls
function updateTextRingFromDebugControls() {
    if (!window.textRing) return;
    
    const textRing = window.textRing;
    const textRadius = parseFloat(document.getElementById('textRadiusControl').value);
    const textTilt = parseFloat(document.getElementById('textTiltControl').value);
    const textColor = document.getElementById('textColorControl').value;
    const textEmissiveColor = document.getElementById('textEmissiveColorControl').value;
    
    // Update text ring tilt
    textRing.rotation.x = textTilt;
    
    document.getElementById('textRadius').textContent = textRadius;
    document.getElementById('textTilt').textContent = textTilt.toFixed(2);
    
    // Update each letter position and material
    textRing.children.forEach((letter, i) => {
        const totalLetters = textRing.children.length;
        const angle = (i / totalLetters) * Math.PI * 2;
        
        // Update position based on new radius
        letter.position.x = textRadius * Math.sin(angle);
        letter.position.z = textRadius * Math.cos(angle);
        
        // Update material
        letter.material.color.set(textColor);
        letter.material.emissive.set(textEmissiveColor);
    });
}

// Update camera from debug controls
function updateCameraFromDebugControls() {
    // Camera position
    const cameraX = parseFloat(document.getElementById('cameraXControl').value);
    const cameraY = parseFloat(document.getElementById('cameraYControl').value);
    const cameraZ = parseFloat(document.getElementById('cameraZControl').value);
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    document.getElementById('cameraX').textContent = cameraX;
    document.getElementById('cameraY').textContent = cameraY;
    document.getElementById('cameraZ').textContent = cameraZ;
    
    // Camera FOV
    const cameraFOV = parseFloat(document.getElementById('cameraFOVControl').value);
    camera.fov = cameraFOV;
    camera.updateProjectionMatrix();
    
    document.getElementById('cameraFOV').textContent = cameraFOV;
    
    // Camera look at
    const targetX = parseFloat(document.getElementById('cameraTargetXControl').value);
    const targetY = parseFloat(document.getElementById('cameraTargetYControl').value);
    const targetZ = parseFloat(document.getElementById('cameraTargetZControl').value);
    
    camera.lookAt(targetX, targetY, targetZ);
    
    document.getElementById('cameraTargetX').textContent = targetX;
    document.getElementById('cameraTargetY').textContent = targetY;
    document.getElementById('cameraTargetZ').textContent = targetZ;
}

// Reset camera to original position
function resetCameraFromDebugControls() {
    const cameraDistance = 15;
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);
    camera.fov = 75;
    camera.updateProjectionMatrix();
    
    // Update UI controls
    document.getElementById('cameraXControl').value = 0;
    document.getElementById('cameraYControl').value = 0;
    document.getElementById('cameraZControl').value = cameraDistance;
    document.getElementById('cameraFOVControl').value = 75;
    document.getElementById('cameraTargetXControl').value = 0;
    document.getElementById('cameraTargetYControl').value = 0;
    document.getElementById('cameraTargetZControl').value = 0;
    
    // Update labels
    document.getElementById('cameraX').textContent = 0;
    document.getElementById('cameraY').textContent = 0;
    document.getElementById('cameraZ').textContent = cameraDistance;
    document.getElementById('cameraFOV').textContent = 75;
    document.getElementById('cameraTargetX').textContent = 0;
    document.getElementById('cameraTargetY').textContent = 0;
    document.getElementById('cameraTargetZ').textContent = 0;
}

// Update scene from debug controls
function updateSceneFromDebugControls() {
    // Background
    const backgroundColor = document.getElementById('backgroundColorControl').value;
    const backgroundOpacity = parseFloat(document.getElementById('backgroundOpacityControl').value);
    
    const bgColor = new THREE.Color(backgroundColor);
    renderer.setClearColor(bgColor, backgroundOpacity);
    
    document.getElementById('backgroundOpacity').textContent = backgroundOpacity.toFixed(2);
    
    // Fog
    const fogEnabled = document.getElementById('fogEnabledControl').checked;
    const fogColor = document.getElementById('fogColorControl').value;
    const fogNear = parseFloat(document.getElementById('fogNearControl').value);
    const fogFar = parseFloat(document.getElementById('fogFarControl').value);
    
    if (fogEnabled) {
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    } else {
        scene.fog = null;
    }
    
    document.getElementById('fogNear').textContent = fogNear;
    document.getElementById('fogFar').textContent = fogFar;
    
    // Back wall
    const wallColor = document.getElementById('wallColorControl').value;
    const wallDistance = parseFloat(document.getElementById('wallDistanceControl').value);
    
    if (window.displayBox && window.displayBox.children.length > 0) {
        // The first child should be the back wall
        const backWall = window.displayBox.children[0];
        if (backWall) {
            backWall.material.color.set(wallColor);
            backWall.position.z = wallDistance;
        }
    }
    
    document.getElementById('wallDistance').textContent = wallDistance;
    
    // Fragments
    fragmentSpeed = parseFloat(document.getElementById('fragmentSpeedDebugControl').value);
    const explosionRadius = parseFloat(document.getElementById('explosionRadiusControl').value);
    
    document.getElementById('fragmentSpeedValue').textContent = fragmentSpeed.toFixed(2);
    document.getElementById('explosionRadiusValue').textContent = explosionRadius;
    
    // Update any existing fragments with new explosion radius
    fragments.forEach((fragment, index) => {
        if (fragment.userData && fragment.userData.targetPosition) {
            const totalFragments = fragments.length;
            const angle = (index / totalFragments) * Math.PI * 2;
            
            // Update target position with new radius
            fragment.userData.targetPosition.x = Math.cos(angle) * explosionRadius;
            fragment.userData.targetPosition.y = Math.sin(angle) * explosionRadius;
        }
    });
    
    // Shadow quality
    const shadowsEnabled = document.getElementById('shadowsEnabledControl').checked;
    const shadowMapSize = parseInt(document.getElementById('shadowMapSizeControl').value);
    const shadowType = document.getElementById('shadowTypeControl').value;
    
    renderer.shadowMap.enabled = shadowsEnabled;
    
    if (shadowsEnabled) {
        // Update shadow map type
        switch (shadowType) {
            case 'basic':
                renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'pcf':
                renderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case 'pcfsoft':
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
            case 'vsm':
                renderer.shadowMap.type = THREE.VSMShadowMap;
                break;
        }
        
        // Update shadow map size for all lights
        [window.mainLight, window.spotLight].forEach(light => {
            if (light && light.shadow) {
                light.shadow.mapSize.width = shadowMapSize;
                light.shadow.mapSize.height = shadowMapSize;
                light.shadow.map?.dispose(); // Force shadow map to be recreated
                light.shadow.needsUpdate = true;
            }
        });
    }
}

// Switch between debug tabs
function switchDebugTab(tabName) {
    debugActiveTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.debug-tab').forEach(tab => {
        tab.style.background = '#333';
    });
    document.getElementById('tab-' + tabName).style.background = '#4a4aff';
    
    // Show/hide panels
    document.querySelectorAll('.debug-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById(tabName + '-panel').style.display = 'block';
}

// Toggle light helper visibility
function toggleLightHelpers() {
    const showHelpers = document.getElementById('showLightHelpers').checked;
    
    // Remove any existing helpers
    lightDebugHelpers.forEach(helper => {
        scene.remove(helper);
    });
    lightDebugHelpers = [];
    
    if (showHelpers) {
        // Create new helpers
        const mainLightHelper = new THREE.DirectionalLightHelper(window.mainLight, 5);
        scene.add(mainLightHelper);
        lightDebugHelpers.push(mainLightHelper);
        
        const spotLightHelper = new THREE.SpotLightHelper(window.spotLight);
        scene.add(spotLightHelper);
        lightDebugHelpers.push(spotLightHelper);
        
        const fillLight1Helper = new THREE.DirectionalLightHelper(window.fillLight1, 3);
        scene.add(fillLight1Helper);
        lightDebugHelpers.push(fillLight1Helper);
        
        const fillLight2Helper = new THREE.DirectionalLightHelper(window.fillLight2, 3);
        scene.add(fillLight2Helper);
        lightDebugHelpers.push(fillLight2Helper);
    }
}

// Update light helpers
function updateLightHelpers() {
    if (document.getElementById('showLightHelpers')?.checked) {
        lightDebugHelpers.forEach(helper => {
            helper.update();
        });
    }
}

// Export light settings
function exportLightSettings() {
    const settings = {
        mainLight: {
            position: {
                x: window.mainLight.position.x,
                y: window.mainLight.position.y,
                z: window.mainLight.position.z
            },
            intensity: window.mainLight.intensity
        },
        spotLight: {
            position: {
                x: window.spotLight.position.x,
                y: window.spotLight.position.y,
                z: window.spotLight.position.z
            },
            intensity: window.spotLight.intensity,
            angle: window.spotLight.angle,
            penumbra: window.spotLight.penumbra
        },
        fillLight1: {
            position: {
                x: window.fillLight1.position.x,
                y: window.fillLight1.position.y,
                z: window.fillLight1.position.z
            },
            intensity: window.fillLight1.intensity
        },
        fillLight2: {
            position: {
                x: window.fillLight2.position.x,
                y: window.fillLight2.position.y,
                z: window.fillLight2.position.z
            },
            intensity: window.fillLight2.intensity
        },
        ambientLight: {
            intensity: window.ambientLight.intensity
        }
    };
    
    console.log('Light Settings:');
    console.log(JSON.stringify(settings, null, 2));
    
    // Create a text display with the settings
    const output = document.createElement('textarea');
    output.value = JSON.stringify(settings, null, 2);
    output.style.position = 'fixed';
    output.style.left = '50%';
    output.style.top = '50%';
    output.style.transform = 'translate(-50%, -50%)';
    output.style.width = '500px';
    output.style.height = '400px';
    output.style.zIndex = '2000';
    document.body.appendChild(output);
    
    // Select all text for easy copying
    output.select();
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'fixed';
    closeBtn.style.left = '50%';
    closeBtn.style.transform = 'translateX(-50%)';
    closeBtn.style.bottom = 'calc(50% - 220px)';
    closeBtn.style.zIndex = '2001';
    closeBtn.style.padding = '8px 16px';
    closeBtn.onclick = function() {
        document.body.removeChild(output);
        document.body.removeChild(closeBtn);
    };
    document.body.appendChild(closeBtn);
}

// Add debug toggle button
function addDebugToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'debugToggle';
    toggleBtn.textContent = 'Debug';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.bottom = '10px';
    toggleBtn.style.right = '10px';
    toggleBtn.style.padding = '8px 16px';
    toggleBtn.style.background = debugMode ? '#4a4aff' : '#333';
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.zIndex = '1000';
    
    toggleBtn.addEventListener('click', toggleDebugMode);
    
    document.body.appendChild(toggleBtn);
}

// Toggle debug mode
function toggleDebugMode() {
    debugMode = !debugMode;
    
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = debugMode ? 'block' : 'none';
    }
    
    const toggleBtn = document.getElementById('debugToggle');
    if (toggleBtn) {
        toggleBtn.style.background = debugMode ? '#4a4aff' : '#333';
    }
    
    // Clear any light helpers when exiting debug mode
    if (!debugMode) {
        lightDebugHelpers.forEach(helper => {
            scene.remove(helper);
        });
        lightDebugHelpers = [];
    }
}

// Initialize when page loads
console.log('Setting up window load event listener...');
window.addEventListener('load', () => {
    console.log('Window load event fired!');
    init();
}); 