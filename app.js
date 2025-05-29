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

// Control parameters
let rotationSpeed = 0.005;
let fragmentSpeed = 1;
let hexagonColor = 0x4a4aff;
let lightIntensity = 1;
let wireframeMode = true;
let controlsVisible = true;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 15, 80);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    originalCameraPosition.copy(camera.position);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 25;
    originalControlsTarget.copy(controls.target);

    // Create lights
    createLights();

    // Create hexagon
    createHexagon();

    // Initialize raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add event listeners
    addEventListeners();

    // Start animation loop
    animate();
}

function createLights() {
    // Ambient light for wireframe visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Fill lights for even wireframe illumination
    const fillLight1 = new THREE.DirectionalLight(0x4a4aff, 0.3);
    fillLight1.position.set(-10, 0, 5);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xd4e157, 0.2);
    fillLight2.position.set(0, -10, 5);
    scene.add(fillLight2);
}

function createHexagon() {
    // 50% more extruded hexagon (1.5 * 1.5 = 2.25)
    const geometry = new THREE.CylinderGeometry(2.5, 2.5, 2.25, 6);
    const material = new THREE.MeshPhongMaterial({ 
        color: hexagonColor,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        wireframe: false // Always show fill
    });
    
    hexagon = new THREE.Mesh(geometry, material);
    hexagon.castShadow = true;
    hexagon.receiveShadow = true;
    hexagon.userData = { clickable: true, type: 'hexagon' };
    scene.add(hexagon);

    // Add white wireframe outline
    const wireframeGeometry = new THREE.CylinderGeometry(2.5, 2.5, 2.25, 6);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const wireframeHex = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    hexagon.add(wireframeHex);
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
        
        // Position fragments in a more dynamic spread
        const angle = (i / numElements) * Math.PI * 2;
        const radius = 4 + Math.random() * 2;
        fragment.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 3
        );

        // Add random rotation
        fragment.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Store velocity for animation
        fragment.userData = {
            clickable: true,
            type: 'fragment',
            element: element,
            originalPosition: fragment.position.clone(),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.03 * fragmentSpeed,
                (Math.random() - 0.5) * 0.03 * fragmentSpeed,
                (Math.random() - 0.5) * 0.03 * fragmentSpeed
            ),
            rotationVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
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
    }
}

function explodeHexagon() {
    if (isExploded) return;
    
    isExploded = true;
    
    // Hide hexagon with animation
    const hexagonTween = {
        scale: { x: 1, y: 1, z: 1 },
        opacity: 0.8
    };
    
    const animate = () => {
        hexagonTween.scale.x *= 0.92;
        hexagonTween.scale.y *= 0.92;
        hexagonTween.scale.z *= 0.92;
        hexagonTween.opacity *= 0.92;
        
        hexagon.scale.set(hexagonTween.scale.x, hexagonTween.scale.y, hexagonTween.scale.z);
        hexagon.material.opacity = hexagonTween.opacity;
        
        if (hexagonTween.scale.x > 0.01) {
            requestAnimationFrame(animate);
        } else {
            hexagon.visible = false;
            createFragments();
        }
    };
    
    animate();
}

function focusOnFragment(fragment) {
    if (focusedFragment === fragment) return;
    
    focusedFragment = fragment;
    
    // Calculate camera position to focus on fragment
    const fragmentPosition = fragment.position.clone();
    const offset = new THREE.Vector3(3, 2, 3);
    const targetCameraPosition = fragmentPosition.clone().add(offset);
    
    // Animate camera to fragment
    animateCamera(targetCameraPosition, fragmentPosition);
    
    // Show element info next to fragment
    showElementInfoAtPosition(fragment.userData.element, fragment);
}

function animateCamera(targetPosition, targetLookAt, duration = 1000) {
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controls.target.lerpVectors(startLookAt, targetLookAt, easeProgress);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

function returnToOverview() {
    if (!focusedFragment) return;
    
    focusedFragment = null;
    hideElementInfo();
    
    // Return camera to original position
    animateCamera(originalCameraPosition, originalControlsTarget);
}

function resetScene() {
    isExploded = false;
    focusedFragment = null;
    
    // Remove fragments
    fragments.forEach(fragment => {
        scene.remove(fragment);
    });
    fragments = [];
    
    // Reset hexagon
    hexagon.visible = true;
    hexagon.scale.set(1, 1, 1);
    hexagon.material.opacity = 0.8;
    hexagon.rotation.set(0, 0, 0);
    
    // Reset camera
    returnToOverview();
    
    // Hide element info
    hideElementInfo();
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
        // Update directional light
        scene.children.forEach(child => {
            if (child instanceof THREE.DirectionalLight && child.intensity > 0.5) {
                child.intensity = lightIntensity * 0.8;
            }
        });
    });
    
    document.getElementById('wireframeMode').addEventListener('change', (e) => {
        wireframeMode = e.target.checked;
        updateWireframeMode();
    });
    
    document.getElementById('resetScene').addEventListener('click', resetScene);
    
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
    
    // Return to overview
    if (key === 'escape') {
        returnToOverview();
    }
    
    // Toggle controls
    if (key === 'h') {
        toggleControls();
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
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Rotate hexagon
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
            
            // Bounce off boundaries
            const boundary = 12;
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
    
    // Update info panel position if focused on fragment
    if (focusedFragment) {
        showElementInfoAtPosition(focusedFragment.userData.element, focusedFragment);
    }
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener('load', init); 