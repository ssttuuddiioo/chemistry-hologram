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

        // Start animation loop
        animate();
        console.log('Animation loop started');
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

function createLights() {
    // Increased ambient light for softer overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Centered directional light positioned above the display box
    const mainLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 1.2);
    mainLight.position.set(0, 10, 5); // Centered above the box
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;  // Slightly lower resolution for softer shadows
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 5;
    mainLight.shadow.camera.far = 30;
    mainLight.shadow.camera.left = -12;
    mainLight.shadow.camera.right = 12;
    mainLight.shadow.camera.top = 12;
    mainLight.shadow.camera.bottom = -12;
    mainLight.shadow.bias = -0.0005; // Adjusted for softer shadows
    mainLight.shadow.radius = 8; // Add shadow softness
    mainLight.target.position.set(0, 0, 0); // Target the center of the display box
    scene.add(mainLight);
    scene.add(mainLight.target);
    
    // Store reference for light intensity updates
    window.mainLight = mainLight;

    // Fill lights positioned outside the box for subtle illumination
    const fillLight1 = new THREE.DirectionalLight(0x4a4aff, 0.2);
    fillLight1.position.set(-15, 5, 10);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xd4e157, 0.2);
    fillLight2.position.set(15, 5, 10);
    scene.add(fillLight2);
    
    // Rim light from behind the box for depth
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);
}

function createHexagon() {
    // 50% more extruded hexagon (2.25 * 1.5 = 3.375)
    const geometry = new THREE.CylinderGeometry(2.5, 2.5, 3.375, 6);
    const material = new THREE.MeshPhongMaterial({ 
        color: hexagonColor,
        shininess: 100,
        transparent: false,
        opacity: 1.0,
        wireframe: false // Always show fill
    });
    
    hexagon = new THREE.Mesh(geometry, material);
    hexagon.castShadow = true;
    hexagon.receiveShadow = true;
    hexagon.userData = { clickable: true, type: 'hexagon' };
    
    // Ensure hexagon is positioned at center
    hexagon.position.set(0, 0, 0);
    
    // Rotate hexagon to face front (90 degrees on X axis)
    hexagon.rotation.x = Math.PI / 2;
    
    scene.add(hexagon);

    // Add white wireframe outline
    const wireframeGeometry = new THREE.CylinderGeometry(2.5, 2.5, 3.375, 6);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const wireframeHex = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    hexagon.add(wireframeHex);
    
    // Create 3D display box (open front)
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
    
    console.log(`Creating locked display box: ${width.toFixed(1)} x ${height.toFixed(1)} x ${depth.toFixed(1)} (aspect: ${aspectRatio.toFixed(2)})`);
    
    // Material for box walls
    const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xf0f0f0,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    
    // Back wall
    const backWall = new THREE.PlaneGeometry(width, height);
    const backMesh = new THREE.Mesh(backWall, boxMaterial);
    backMesh.position.z = -depth/2;
    backMesh.receiveShadow = true;
    boxGroup.add(backMesh);
    
    // Bottom wall (floor)
    const bottomWall = new THREE.PlaneGeometry(width, depth);
    const bottomMesh = new THREE.Mesh(bottomWall, boxMaterial);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.y = -height/2;
    bottomMesh.receiveShadow = true;
    boxGroup.add(bottomMesh);
    
    // Top wall (ceiling)
    const topWall = new THREE.PlaneGeometry(width, depth);
    const topMesh = new THREE.Mesh(topWall, boxMaterial);
    topMesh.rotation.x = Math.PI / 2;
    topMesh.position.y = height/2;
    topMesh.receiveShadow = true;
    boxGroup.add(topMesh);
    
    // Left wall
    const leftWall = new THREE.PlaneGeometry(depth, height);
    const leftMesh = new THREE.Mesh(leftWall, boxMaterial);
    leftMesh.rotation.y = Math.PI / 2;
    leftMesh.position.x = -width/2;
    leftMesh.receiveShadow = true;
    boxGroup.add(leftMesh);
    
    // Right wall
    const rightWall = new THREE.PlaneGeometry(depth, height);
    const rightMesh = new THREE.Mesh(rightWall, boxMaterial);
    rightMesh.rotation.y = -Math.PI / 2;
    rightMesh.position.x = width/2;
    rightMesh.receiveShadow = true;
    boxGroup.add(rightMesh);
    
    // Add subtle wireframe edges to enhance the box structure
    const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5
    });
    
    // Create box frame edges
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const boxEdges = new THREE.LineSegments(edges, edgesMaterial);
    boxGroup.add(boxEdges);
    
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
            transparent: true,
            opacity: 0.7,
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
            transparent: true,
            opacity: 0.5
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
    
    // Clean up Hozi mode if active
    if (isHoziModeActive) {
        removeFloatingEyes();
        isHoziModeActive = false;
    }
    
    // Create fragments at hexagon position FIRST
    createFragments();
    
    // Start hexagon break animation AND fragment explosion simultaneously
    const hexagonTween = {
        scale: { x: 1, y: 1, z: 1 },
        opacity: 0.8
    };
    
    // Start fragment explosion immediately
    setTimeout(() => {
        fragments.forEach((fragment, index) => {
            // Calculate explosion direction from center
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
    
    // Reset hexagon
    hexagon.visible = true;
    hexagon.position.set(0, 0, 0); // Ensure hexagon is at center
    hexagon.scale.set(1, 1, 1);
    hexagon.material.opacity = 1.0;
    hexagon.rotation.set(Math.PI / 2, 0, 0); // Reset rotation to initial state
    
    // Camera will automatically return to rigged position as hexagon resets
    
    // Reset focused fragment
    focusedFragment = null;
    
    // Hide element info
    hideElementInfo();
    
    // Show Hozi button since hexagon is now complete
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
            window.mainLight.intensity = lightIntensity * 1.5;
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
    
    // Rotate hexagon (camera stays completely fixed)
    if (hexagon && hexagon.visible) {
        hexagon.rotation.y += rotationSpeed;
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

// Initialize when page loads
console.log('Setting up window load event listener...');
window.addEventListener('load', () => {
    console.log('Window load event fired!');
    init();
}); 