
        class MilkyWayExplorer {
            constructor() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                this.clock = new THREE.Clock();
                
                this.galaxyGroup = new THREE.Group();
                this.starField = new THREE.Group();
                this.planetGroup = new THREE.Group();
                this.nebulaeGroup = new THREE.Group();
                
                this.mouse = new THREE.Vector2();
                this.mousePx = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
                this.raycaster = new THREE.Raycaster();
                this.raycaster.params.Points.threshold = 2; // not heavily used but set for points
                this.selectedObject = null;
                this.autoRotate = true;
                
                this.stars = [];
                this.planets = [];
                this.nebulae = [];
                
                this.zoomLevel = 1;
                this.targetZoom = 1;
                this.rotationSpeed = 0.001;
                
                this.frameCount = 0;
                this.fps = 60;
                
                this.init();
                this.createGalaxy();
                this.createStarField();
                this.createPlanets();
                this.createNebulae();
                this.setupEventListeners();
                this.animate();
                
                // Hide loading screen after 3 seconds
                setTimeout(() => {
                    const ls = document.getElementById('loadingScreen');
                    ls.style.opacity = '0';
                    setTimeout(() => ls.style.display = 'none', 1000);
                }, 3000);
            }
            
            init() {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setClearColor(0x000000, 0);
                document.getElementById('galaxy-container').appendChild(this.renderer.domElement);
                
                // Camera position
                this.camera.position.set(0, 50, 100);
                this.camera.lookAt(0, 0, 0);
                
                // Add groups to scene
                this.scene.add(this.galaxyGroup);
                this.scene.add(this.starField);
                this.scene.add(this.planetGroup);
                this.scene.add(this.nebulaeGroup);
                
                // Ambient lighting
                const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
                this.scene.add(ambientLight);
                
                // Point light for galaxy center
                const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
                pointLight.position.set(0, 0, 0);
                this.scene.add(pointLight);
                
                // graceful resize
                window.addEventListener('resize', () => this.onWindowResize());
            }
            
            createGalaxy() {
                const galaxyGeometry = new THREE.BufferGeometry();
                const galaxyMaterial = new THREE.PointsMaterial({
                    size: 0.8,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending
                });
                
                const starCount = 50000;
                const positions = new Float32Array(starCount * 3);
                const colors = new Float32Array(starCount * 3);
                
                // Create spiral arms
                for (let i = 0; i < starCount; i++) {
                    const i3 = i * 3;
                    
                    // Spiral parameters
                    const armCount = 4;
                    const armIndex = Math.floor(Math.random() * armCount);
                    const armAngle = (armIndex / armCount) * Math.PI * 2;
                    const spiralTightness = 3;
                    
                    const radius = Math.random() * 80 + 10;
                    const spiralAngle = armAngle + (radius / 80) * spiralTightness;
                    const scatter = (Math.random() - 0.5) * 10;
                    
                    const x = Math.cos(spiralAngle) * radius + scatter;
                    const z = Math.sin(spiralAngle) * radius + scatter;
                    const y = (Math.random() - 0.5) * 5;
                    
                    positions[i3] = x;
                    positions[i3 + 1] = y;
                    positions[i3 + 2] = z;
                    
                    // Color based on distance from center and arm
                    const distanceFromCenter = Math.sqrt(x*x + z*z);
                    const normalizedDistance = distanceFromCenter / 80;
                    
                    if (distanceFromCenter < 15) {
                        // Core - yellow/white
                        colors[i3] = 1;
                        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                        colors[i3 + 2] = 0.6 + Math.random() * 0.4;
                    } else if (normalizedDistance < 0.6) {
                        // Main disk - white/blue
                        colors[i3] = 0.7 + Math.random() * 0.3;
                        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
                        colors[i3 + 2] = 1;
                    } else {
                        // Outer disk - red/orange
                        colors[i3] = 1;
                        colors[i3 + 1] = 0.4 + Math.random() * 0.4;
                        colors[i3 + 2] = 0.2 + Math.random() * 0.3;
                    }
                    
                    // Store star data for interaction
                    this.stars.push({
                        position: new THREE.Vector3(x, y, z),
                        color: new THREE.Color(colors[i3], colors[i3 + 1], colors[i3 + 2]),
                        type: this.getStarType(distanceFromCenter),
                        mass: (Math.random() * 2 + 0.5).toFixed(2) + ' M☉',
                        temperature: Math.floor(Math.random() * 20000 + 3000) + 'K',
                        age: (Math.random() * 13 + 0.1).toFixed(2) + ' Gyr'
                    });
                }
                
                galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                
                const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
                this.galaxyGroup.add(galaxyPoints);
                
                // Add central black hole
                const blackHoleGeometry = new THREE.SphereGeometry(2, 32, 32);
                const blackHoleMaterial = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.9
                });
                const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
                
                // Add accretion disk
                const diskGeometry = new THREE.RingGeometry(2.5, 8, 64);
                const diskMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
                accretionDisk.rotation.x = Math.PI / 2;
                
                this.galaxyGroup.add(blackHole);
                this.galaxyGroup.add(accretionDisk);
            }
            
            getStarType(distance) {
                if (distance < 15) return 'Supergiant';
                if (distance < 30) return 'Giant';
                if (distance < 50) return 'Main Sequence';
                if (distance < 70) return 'White Dwarf';
                return 'Red Dwarf';
            }
            
            createStarField() {
                const starGeometry = new THREE.BufferGeometry();
                const starMaterial = new THREE.PointsMaterial({
                    size: 0.1,
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                });
                
                const starCount = 10000;
                const positions = new Float32Array(starCount * 3);
                
                for (let i = 0; i < starCount * 3; i += 3) {
                    positions[i] = (Math.random() - 0.5) * 2000;
                    positions[i + 1] = (Math.random() - 0.5) * 2000;
                    positions[i + 2] = (Math.random() - 0.5) * 2000;
                }
                
                starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const stars = new THREE.Points(starGeometry, starMaterial);
                this.starField.add(stars);
            }
            
            createPlanets() {
                const planetData = [
                    { name: 'Kepler-442b', type: 'Exoplanet', distance: 45, color: 0x4444ff, size: 0.8 },
                    { name: 'HD 40307g', type: 'Super Earth', distance: 55, color: 0x44ff44, size: 1.2 },
                    { name: 'Gliese 667Cc', type: 'Rocky Planet', distance: 35, color: 0xff8844, size: 0.9 },
                    { name: 'Wolf 1061c', type: 'Terrestrial', distance: 65, color: 0xff4444, size: 0.7 },
                    { name: 'Proxima b', type: 'Earth-like', distance: 25, color: 0x44ffff, size: 0.95 }
                ];
                
                planetData.forEach((data, index) => {
                    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
                    const planetMaterial = new THREE.MeshLambertMaterial({
                        color: data.color,
                        transparent: true,
                        opacity: 0.95
                    });
                    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
                    
                    const angle = (index / planetData.length) * Math.PI * 2;
                    planet.position.set(
                        Math.cos(angle) * data.distance,
                        Math.random() * 10 - 5,
                        Math.sin(angle) * data.distance
                    );
                    
                    planet.userData = {
                        name: data.name,
                        type: data.type,
                        distance: data.distance + ' ly',
                        mass: (Math.random() * 5 + 0.5).toFixed(2) + ' Earth masses',
                        temperature: (Math.random() * 500 + 200).toFixed(0) + ' K',
                        age: (Math.random() * 5 + 0.1).toFixed(2) + ' Gyr'
                    };
                    
                    this.planets.push(planet);
                    this.planetGroup.add(planet);
                });
                
                this.planetGroup.visible = false;
            }
            
            createNebulae() {
                const nebulaeData = [
                    { name: 'Orion Nebula', color: 0xff4444, position: [30, 15, 40] },
                    { name: 'Eagle Nebula', color: 0x4444ff, position: [-40, -20, 35] },
                    { name: 'Crab Nebula', color: 0x44ff44, position: [25, -30, -45] },
                    { name: 'Horsehead Nebula', color: 0xff8844, position: [-35, 25, -30] }
                ];
                
                nebulaeData.forEach((data, index) => {
                    const nebulaGeometry = new THREE.SphereGeometry(8, 32, 32);
                    const nebulaMaterial = new THREE.MeshBasicMaterial({
                        color: data.color,
                        transparent: true,
                        opacity: 0.3,
                        blending: THREE.AdditiveBlending
                    });
                    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
                    
                    nebula.position.set(...data.position);
                    nebula.userData = {
                        name: data.name,
                        type: 'Nebula',
                        distance: Math.sqrt(data.position[0]**2 + data.position[1]**2 + data.position[2]**2).toFixed(1) + ' ly',
                        composition: 'Hydrogen, Helium, Dust',
                        age: (Math.random() * 10 + 1).toFixed(1) + ' million years'
                    };
                    
                    this.nebulae.push(nebula);
                    this.nebulaeGroup.add(nebula);
                });
                
                this.nebulaeGroup.visible = false;
            }
            
            setupEventListeners() {
                // Mouse movement
                document.addEventListener('mousemove', (event) => {
                    const cursor = document.getElementById('cursor');
                    cursor.style.left = event.clientX - 15 + 'px';
                    cursor.style.top = event.clientY - 15 + 'px';
                    
                    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    this.mousePx.x = event.clientX;
                    this.mousePx.y = event.clientY;
                    
                    this.checkIntersections();
                });
                
                // Mouse wheel for zooming
                document.addEventListener('wheel', (event) => {
                    event.preventDefault();
                    const zoomDelta = event.deltaY > 0 ? 1.08 : 0.92;
                    this.targetZoom = Math.max(0.5, Math.min(8, this.targetZoom * zoomDelta));
                }, { passive: false });
                
                // Click to select objects
                document.addEventListener('click', (event) => {
                    // Attempt selection
                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    const allObjects = [...this.planets, ...this.nebulae];
                    const intersects = this.raycaster.intersectObjects(allObjects, true);
                    if (intersects.length > 0) {
                        const hit = intersects[0].object;
                        this.selectObject(hit);
                    } else {
                        // Deselect
                        this.selectObject(null);
                    }
                });
                
                // Control buttons
                document.getElementById('autoRotate').addEventListener('click', (e) => {
                    this.autoRotate = !this.autoRotate;
                    e.target.classList.toggle('active');
                });
                
                document.getElementById('showPlanets').addEventListener('click', (e) => {
                    this.planetGroup.visible = !this.planetGroup.visible;
                    e.target.classList.toggle('active');
                });
                
                document.getElementById('showNebulae').addEventListener('click', (e) => {
                    this.nebulaeGroup.visible = !this.nebulaeGroup.visible;
                    e.target.classList.toggle('active');
                });
                
                document.getElementById('deepScan').addEventListener('click', (e) => {
                    const scanner = document.getElementById('scanner');
                    const active = scanner.classList.contains('active');
                    if (!active) {
                        scanner.classList.add('active');
                        e.target.classList.add('active');
                        // show briefly then hide
                        setTimeout(() => {
                            scanner.classList.remove('active');
                            e.target.classList.remove('active');
                        }, 3000);
                    } else {
                        scanner.classList.remove('active');
                        e.target.classList.remove('active');
                    }
                });
            }
            
            selectObject(object) {
                const selectedEl = document.getElementById('selectedObject');
                const typeEl = document.getElementById('objectType');
                const massEl = document.getElementById('objectMass');
                const tempEl = document.getElementById('objectTemp');
                const ageEl = document.getElementById('objectAge');
                
                if (!object) {
                    this.selectedObject = null;
                    selectedEl.textContent = 'None';
                    typeEl.textContent = '-';
                    massEl.textContent = '-';
                    tempEl.textContent = '-';
                    ageEl.textContent = '-';
                    return;
                }
                
                this.selectedObject = object;
                const data = object.userData || {};
                selectedEl.textContent = data.name || 'Unknown';
                typeEl.textContent = data.type || '-';
                massEl.textContent = data.mass || (data.composition || '-');
                tempEl.textContent = data.temperature || '-';
                ageEl.textContent = data.age || '-';
            }
            
            checkIntersections() {
                // Raycast against planets and nebulae for tooltip
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const all = [...this.planets, ...this.nebulae];
                const intersects = this.raycaster.intersectObjects(all, true);
                const tooltip = document.getElementById('objectInfo');
                if (intersects.length > 0) {
                    const hit = intersects[0].object;
                    const data = hit.userData || {};
                    document.getElementById('infoName').textContent = data.name || 'Unknown';
                    document.getElementById('infoType').textContent = (data.type || 'Object').toUpperCase();
                    document.getElementById('infoDistance').textContent = data.distance || '-';
                    document.getElementById('infoMagnitude').textContent = data.mass || '-';
                    
                    // Position tooltip near cursor, but keep it on-screen
                    const padding = 12;
                    let left = this.mousePx.x + 18;
                    let top = this.mousePx.y + 18;
                    const tooltipRect = tooltip.getBoundingClientRect();
                    if (left + tooltipRect.width + padding > window.innerWidth) left = this.mousePx.x - tooltipRect.width - 18;
                    if (top + tooltipRect.height + padding > window.innerHeight) top = this.mousePx.y - tooltipRect.height - 18;
                    
                    tooltip.style.left = left + 'px';
                    tooltip.style.top = top + 'px';
                    tooltip.classList.add('visible');
                } else {
                    tooltip.classList.remove('visible');
                }
            }
            
            updateHUD(delta) {
                // FPS smoothing
                this.frameCount++;
                if (this.frameCount % 10 === 0) {
                    const currentFps = Math.round(1 / delta);
                    this.fps = Math.round(this.fps * 0.9 + currentFps * 0.1);
                    document.getElementById('fps').textContent = this.fps;
                }
                
                document.getElementById('starCount').textContent = this.stars.length.toLocaleString();
                document.getElementById('particleCount').textContent = (10000 + 50000).toLocaleString(); // approximate
                document.getElementById('zoomLevel').textContent = this.zoomLevel.toFixed(2) + 'x';
                
                // Update rotation bar visually
                const rotationPercent = Math.min(100, Math.abs(this.rotationSpeed) * 10000);
                document.getElementById('galaxyRotation').style.width = rotationPercent + '%';
            }
            
            animate() {
                requestAnimationFrame(() => this.animate());
                const delta = this.clock.getDelta();
                
                // Smooth zoom interpolation
                this.zoomLevel += (this.targetZoom - this.zoomLevel) * Math.min(1, delta * 3);
                // Move camera forward/back by zoom level (simple)
                this.camera.position.z = 100 / this.zoomLevel;
                
                // Auto rotate galaxy
                if (this.autoRotate) {
                    this.galaxyGroup.rotation.y += this.rotationSpeed;
                    // Slight parallax of nebulae
                    this.nebulaeGroup.rotation.y -= this.rotationSpeed * 0.2;
                }
                
                // subtle planet orbit animation
                this.planetGroup.children.forEach((planet, idx) => {
                    const speed = 0.001 + idx * 0.0005;
                    planet.position.applyAxisAngle(new THREE.Vector3(0,1,0), speed);
                });
                
                // Update HUD and system info periodically
                this.updateHUD(delta);
                
                // render
                this.renderer.render(this.scene, this.camera);
            }
            
            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }
        
        // instantiate explorer
        const explorer = new MilkyWayExplorer();
    