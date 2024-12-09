let mapScene, mapCamera, mapRenderer, mapControls;
let isMapInitialized = false;
let flightPaths = [];
let airplanes = [];
let currentFlight = null;
let flightInfo = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hoveredAirport = null;
let airportLabels = {};

// Base de données des aéroports
const airports = {
    'DSS': { lat: 14.7397, lon: -17.4902, name: 'Dakar', region: 'WEST_AFRICA' },
    'CDG': { lat: 49.0097, lon: 2.5479, name: 'Paris', region: 'EUROPE' },
    'JFK': { lat: 40.6413, lon: -73.7781, name: 'New York', region: 'NORTH_AMERICA' },
    'DXB': { lat: 25.2532, lon: 55.3657, name: 'Dubai', region: 'MIDDLE_EAST' },
    'MAD': { lat: 40.4983, lon: -3.5676, name: 'Madrid', region: 'EUROPE' },
    'LHR': { lat: 51.4700, lon: -0.4543, name: 'Londres', region: 'EUROPE' },
    'IST': { lat: 41.2615, lon: 28.7251, name: 'Istanbul', region: 'EUROPE' },
    'CAS': { lat: 33.3677, lon: -7.5897, name: 'Casablanca', region: 'NORTH_AFRICA' },
    'ACC': { lat: 5.6052, lon: -0.1717, name: 'Accra', region: 'WEST_AFRICA' },
    'LOS': { lat: 6.5774, lon: 3.3212, name: 'Lagos', region: 'WEST_AFRICA' },
    'ABJ': { lat: 5.2610, lon: -3.9262, name: 'Abidjan', region: 'WEST_AFRICA' },
    'NKC': { lat: 18.0969, lon: -15.9486, name: 'Nouakchott', region: 'WEST_AFRICA' },
    'BKO': { lat: 12.5352, lon: -7.9495, name: 'Bamako', region: 'WEST_AFRICA' },
    'OUA': { lat: 12.3532, lon: -1.5124, name: 'Ouagadougou', region: 'WEST_AFRICA' },
    'COO': { lat: 6.3573, lon: 2.3843, name: 'Cotonou', region: 'WEST_AFRICA' }
};

// Convertit les coordonnées lat/lon en position 3D
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Crée une courbe entre deux points avec une hauteur d'arc
function createArc(start, end, arcHeight) {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    
    // Ajuste la hauteur de l'arc en fonction de la distance
    const height = distance * arcHeight;
    midPoint.normalize().multiplyScalar(start.length() + height);
    
    return new THREE.QuadraticBezierCurve3(start, midPoint, end);
}

// Calcule la distance entre deux points en km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Estime la durée du vol en heures
function estimateFlightDuration(distance) {
    const avgSpeed = 850; // Vitesse moyenne en km/h
    return distance / avgSpeed;
}

// Crée une étiquette HTML pour l'aéroport
function createAirportLabel(airport, code) {
    const label = document.createElement('div');
    label.className = 'airport-label';
    label.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        display: none;
        z-index: 1000;
    `;
    label.textContent = `${airport.name} (${code})`;
    document.getElementById('flight-map-container').appendChild(label);
    return label;
}

// Met à jour la position de l'étiquette
function updateLabelPosition(label, position) {
    const vector = position.clone();
    vector.project(mapCamera);
    
    const x = (vector.x * 0.5 + 0.5) * mapRenderer.domElement.clientWidth;
    const y = (-vector.y * 0.5 + 0.5) * mapRenderer.domElement.clientHeight;
    
    label.style.transform = `translate(-50%, -100%) translate(${x}px,${y}px)`;
    label.style.display = vector.z < 1 ? 'block' : 'none';
}

// Crée un modèle d'avion
function createAirplane() {
    const geometry = new THREE.ConeGeometry(0.5, 2, 3);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xff9900,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    return new THREE.Mesh(geometry, material);
}

// Crée un panneau d'information de vol
function createFlightInfo() {
    const info = document.createElement('div');
    info.className = 'flight-info';
    info.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
    `;
    document.getElementById('flight-map-container').appendChild(info);
    return info;
}

// Met à jour les informations de vol
function updateFlightInfo(departure, destination, escale = null) {
    if (!flightInfo) return;
    
    let totalDistance = 0;
    let totalDuration = 0;
    
    if (escale) {
        const dist1 = calculateDistance(
            airports[departure].lat, airports[departure].lon,
            airports[escale].lat, airports[escale].lon
        );
        const dist2 = calculateDistance(
            airports[escale].lat, airports[escale].lon,
            airports[destination].lat, airports[destination].lon
        );
        totalDistance = dist1 + dist2;
        totalDuration = estimateFlightDuration(totalDistance) + 1; // +1h pour l'escale
    } else {
        totalDistance = calculateDistance(
            airports[departure].lat, airports[departure].lon,
            airports[destination].lat, airports[destination].lon
        );
        totalDuration = estimateFlightDuration(totalDistance);
    }
    
    flightInfo.innerHTML = `
        <strong>Informations de vol</strong><br>
        Départ: ${airports[departure].name} (${departure})<br>
        ${escale ? `Escale: ${airports[escale].name} (${escale})<br>` : ''}
        Arrivée: ${airports[destination].name} (${destination})<br>
        Distance: ${Math.round(totalDistance)} km<br>
        Durée estimée: ${Math.round(totalDuration * 10) / 10}h
    `;
}

// Crée un trajet de vol animé
function createFlightPath(departure, destination, escale = null) {
    clearFlightPaths();
    
    const radius = 50;
    const curves = [];
    
    if (escale) {
        const startPos = latLonToVector3(airports[departure].lat, airports[departure].lon, radius);
        const escalePos = latLonToVector3(airports[escale].lat, airports[escale].lon, radius);
        const endPos = latLonToVector3(airports[destination].lat, airports[destination].lon, radius);
        
        curves.push(createArc(startPos, escalePos, 0.3));
        curves.push(createArc(escalePos, endPos, 0.3));
    } else {
        const startPos = latLonToVector3(airports[departure].lat, airports[departure].lon, radius);
        const endPos = latLonToVector3(airports[destination].lat, airports[destination].lon, radius);
        
        curves.push(createArc(startPos, endPos, 0.3));
    }
    
    curves.forEach((curve, index) => {
        // Crée le trajet
        const geometry = new THREE.TubeGeometry(curve, 100, 0.3, 8, false);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
            emissive: 0x00ff00,
            emissiveIntensity: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mapScene.add(mesh);
        
        // Ajoute un avion
        const airplane = createAirplane();
        mapScene.add(airplane);
        
        flightPaths.push({
            mesh,
            material,
            curve,
            airplane,
            progress: 0,
            startTime: Date.now() + index * 1000
        });
    });
    
    // Met à jour les informations de vol
    updateFlightInfo(departure, destination, escale);
}

// Nettoie les trajets de vol
function clearFlightPaths() {
    flightPaths.forEach(path => {
        mapScene.remove(path.mesh);
        mapScene.remove(path.airplane);
        path.material.dispose();
        path.mesh.geometry.dispose();
    });
    flightPaths = [];
}

function initFlightMap() {
    if (isMapInitialized) return;
    
    console.log('Initializing flight map...');
    
    const container = document.getElementById('flight-map-container');
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    try {
        // Scene
        mapScene = new THREE.Scene();
        mapScene.background = new THREE.Color(0x1a1a1a);
        
        // Camera
        const width = container.clientWidth;
        const height = container.clientHeight;
        console.log('Container dimensions:', width, height);
        
        mapCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        mapCamera.position.set(0, 30, 100);
        
        // Renderer with antialias
        mapRenderer = new THREE.WebGLRenderer({ antialias: true });
        mapRenderer.setSize(width, height);
        mapRenderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = '';
        container.appendChild(mapRenderer.domElement);
        
        // OrbitControls
        mapControls = new THREE.OrbitControls(mapCamera, mapRenderer.domElement);
        mapControls.enableDamping = true;
        mapControls.dampingFactor = 0.05;
        mapControls.screenSpacePanning = false;
        mapControls.minDistance = 50;
        mapControls.maxDistance = 300;
        mapControls.maxPolarAngle = Math.PI / 1.5;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        mapScene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(100, 100, 100);
        mapScene.add(pointLight);
        
        // Create Earth
        const radius = 50;
        const segments = 64;
        const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Create a basic material with grid pattern
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2194ce,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        mapScene.add(earth);
        
        // Add meridians and parallels
        const linesMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
        
        // Meridians
        for (let i = 0; i < 24; i++) {
            const longitude = (i / 24) * Math.PI * 2;
            const points = [];
            for (let j = 0; j <= 180; j++) {
                const latitude = (j / 180) * Math.PI - Math.PI / 2;
                const x = radius * Math.cos(latitude) * Math.cos(longitude);
                const y = radius * Math.sin(latitude);
                const z = radius * Math.cos(latitude) * Math.sin(longitude);
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, linesMaterial);
            mapScene.add(line);
        }
        
        // Parallels
        for (let i = 0; i < 12; i++) {
            const latitude = ((i / 12) * Math.PI - Math.PI / 2);
            const points = [];
            for (let j = 0; j <= 360; j++) {
                const longitude = (j / 360) * Math.PI * 2;
                const x = radius * Math.cos(latitude) * Math.cos(longitude);
                const y = radius * Math.sin(latitude);
                const z = radius * Math.cos(latitude) * Math.sin(longitude);
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, linesMaterial);
            mapScene.add(line);
        }
        
        // Add airport markers
        const markerGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.2,
            shininess: 100
        });
        
        Object.entries(airports).forEach(([code, airport]) => {
            const lat = airport.lat * (Math.PI / 180);
            const lon = airport.lon * (Math.PI / 180);
            
            const x = radius * Math.cos(lat) * Math.cos(lon);
            const y = radius * Math.sin(lat);
            const z = radius * Math.cos(lat) * Math.sin(lon);
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(x, y, z);
            marker.userData.airport = code;
            mapScene.add(marker);
            
            // Crée une étiquette pour cet aéroport
            airportLabels[code] = createAirportLabel(airport, code);
        });
        
        // Ajoute le panneau d'information de vol
        flightInfo = createFlightInfo();
        
        // Ajoute les gestionnaires d'événements de la souris
        const container = document.getElementById('flight-map-container');
        
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        });
        
        // Handle window resize
        function handleResize() {
            if (!container) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            
            mapCamera.aspect = newWidth / newHeight;
            mapCamera.updateProjectionMatrix();
            
            mapRenderer.setSize(newWidth, newHeight);
        }
        
        window.addEventListener('resize', handleResize);
        
        // Animation
        function animate() {
            if (!isMapInitialized) return;
            requestAnimationFrame(animate);
            
            // Update controls
            mapControls.update();
            
            // Slowly rotate the earth
            earth.rotation.y += 0.0005;
            
            // Raycasting pour les étiquettes d'aéroport
            raycaster.setFromCamera(mouse, mapCamera);
            const intersects = raycaster.intersectObjects(mapScene.children);
            
            let foundAirport = false;
            for (const intersect of intersects) {
                if (intersect.object.userData.airport) {
                    const code = intersect.object.userData.airport;
                    airportLabels[code].style.display = 'block';
                    updateLabelPosition(airportLabels[code], intersect.object.position);
                    foundAirport = true;
                    break;
                }
            }
            
            if (!foundAirport) {
                Object.values(airportLabels).forEach(label => {
                    label.style.display = 'none';
                });
            }
            
            // Anime les trajets de vol et les avions
            const now = Date.now();
            flightPaths.forEach(path => {
                const elapsed = now - path.startTime;
                const duration = 5000; // 5 secondes pour l'animation complète
                
                // Animation de la ligne
                const progress = (elapsed % duration) / duration;
                path.material.opacity = 0.8 * (1 + Math.sin(progress * Math.PI * 2)) * 0.5;
                path.material.emissiveIntensity = 0.3 * (1 + Math.sin(progress * Math.PI * 2)) * 0.5;
                
                // Animation de l'avion
                const point = path.curve.getPointAt(progress);
                path.airplane.position.copy(point);
                
                // Oriente l'avion dans la direction du vol
                const tangent = path.curve.getTangentAt(progress);
                path.airplane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            });
            
            mapRenderer.render(mapScene, mapCamera);
        }
        
        isMapInitialized = true;
        animate();
        console.log('Flight map initialized successfully');
        
    } catch (error) {
        console.error('Error initializing flight map:', error);
        isMapInitialized = false;
    }
}

// Fonction pour mettre à jour les destinations possibles
function updateDestinations(departure) {
    const destinationSelect = document.getElementById('destination');
    destinationSelect.innerHTML = '<option value="">Choisissez votre destination</option>';
    
    Object.keys(airports).forEach(code => {
        if (code !== departure) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${airports[code].name} (${code})`;
            destinationSelect.appendChild(option);
        }
    });
}

// Initialize when section is visible
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up observer...');
    
    const reservationSection = document.getElementById('reservation');
    if (!reservationSection) {
        console.error('Reservation section not found');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isMapInitialized) {
                console.log('Reservation section is visible, initializing map...');
                initFlightMap();
            }
        });
    });

    observer.observe(reservationSection);
    
    // Set up form event listeners
    const departSelect = document.getElementById('depart');
    const destinationSelect = document.getElementById('destination');
    const escaleSelect = document.getElementById('escale');
    
    // Gestionnaire pour le changement de départ
    departSelect.addEventListener('change', (e) => {
        const departure = e.target.value;
        if (departure) {
            updateDestinations(departure);
            const destination = destinationSelect.value;
            if (destination) {
                createFlightPath(departure, destination, escaleSelect.value || null);
            }
        }
    });
    
    // Gestionnaire pour le changement de destination
    destinationSelect.addEventListener('change', (e) => {
        const destination = e.target.value;
        const departure = departSelect.value;
        if (departure && destination) {
            createFlightPath(departure, destination, escaleSelect.value || null);
        }
    });
    
    // Gestionnaire pour le changement d'escale
    escaleSelect.addEventListener('change', (e) => {
        const departure = departSelect.value;
        const destination = destinationSelect.value;
        if (departure && destination) {
            createFlightPath(departure, destination, e.target.value || null);
        }
    });
});
