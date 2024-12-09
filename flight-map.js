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

// Hubs régionaux pour les escales
const regionalHubs = {
    'EUROPE': ['CDG', 'MAD', 'LHR', 'IST'],
    'WEST_AFRICA': ['DSS', 'ACC', 'LOS', 'ABJ'],
    'NORTH_AFRICA': ['CAS'],
    'MIDDLE_EAST': ['DXB'],
    'NORTH_AMERICA': ['JFK']
};

// Fonction pour calculer la distance entre deux aéroports
function calculateDistance(airport1, airport2) {
    const R = 6371; // Rayon de la Terre en km
    const lat1 = airports[airport1].lat * Math.PI / 180;
    const lat2 = airports[airport2].lat * Math.PI / 180;
    const dLat = lat2 - lat1;
    const dLon = (airports[airport2].lon - airports[airport1].lon) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Fonction pour trouver les escales possibles
function findPossibleStops(departure, destination) {
    const departureRegion = airports[departure].region;
    const destinationRegion = airports[destination].region;
    const distance = calculateDistance(departure, destination);
    
    let possibleStops = new Set();
    
    // Si la distance est supérieure à 8000km, on suggère des escales
    if (distance > 8000) {
        // Ajoute les hubs de la région de départ
        regionalHubs[departureRegion]?.forEach(hub => {
            if (hub !== departure && hub !== destination) {
                possibleStops.add(hub);
            }
        });
        
        // Ajoute les hubs de la région d'arrivée
        regionalHubs[destinationRegion]?.forEach(hub => {
            if (hub !== departure && hub !== destination) {
                possibleStops.add(hub);
            }
        });
        
        // Ajoute des hubs intermédiaires stratégiques
        if (departureRegion === 'WEST_AFRICA' && destinationRegion === 'NORTH_AMERICA') {
            possibleStops.add('CAS');
            possibleStops.add('MAD');
        }
    }
    // Si la distance est entre 5000 et 8000km, on suggère des escales régionales
    else if (distance > 5000) {
        regionalHubs[departureRegion]?.forEach(hub => {
            if (hub !== departure && hub !== destination) {
                possibleStops.add(hub);
            }
        });
    }
    
    return Array.from(possibleStops);
}

let mapScene, mapCamera, mapRenderer, mapControls;
let flightPaths = [];
let planes = [];

function initFlightMap() {
    // Création de la scène
    mapScene = new THREE.Scene();
    
    // Configuration de la caméra
    mapCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    mapCamera.position.set(0, 100, 200);
    
    // Configuration du renderer
    mapRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    mapRenderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('flight-map-container');
    container.appendChild(mapRenderer.domElement);
    
    // Ajout des contrôles OrbitControls
    mapControls = new THREE.OrbitControls(mapCamera, mapRenderer.domElement);
    mapControls.enableDamping = true;
    mapControls.dampingFactor = 0.05;
    
    // Création de la Terre plate (pour la démo)
    const earthGeometry = new THREE.PlaneGeometry(300, 150);
    const earthTexture = new THREE.TextureLoader().load('assets/images/world-map.jpg');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.x = -Math.PI / 2;
    mapScene.add(earth);
    
    // Ajout de lumière ambiante
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    mapScene.add(ambientLight);
    
    // Ajout de lumière directionnelle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 100, 0);
    mapScene.add(directionalLight);
    
    // Animation
    animateMap();
}

function createFlight(startLat, startLon, endLat, endLon) {
    // Conversion des coordonnées géographiques en coordonnées 3D
    const start = latLonToVector3(startLat, startLon);
    const end = latLonToVector3(endLat, endLon);
    
    // Création de la courbe de vol
    const control = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 30,
        (start.z + end.z) / 2
    );
    
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    
    // Création de la ligne de vol
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const flightPath = new THREE.Line(geometry, material);
    mapScene.add(flightPath);
    flightPaths.push(flightPath);
    
    // Création de l'avion
    const planeGeometry = new THREE.ConeGeometry(2, 8, 3);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    mapScene.add(plane);
    planes.push({ mesh: plane, curve: curve, progress: 0 });
}

function latLonToVector3(lat, lon) {
    // Conversion des coordonnées géographiques en coordonnées cartésiennes
    const radius = 150; // Taille de la carte
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        10,
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function animateMap() {
    requestAnimationFrame(animateMap);
    
    // Animation des avions
    planes.forEach(plane => {
        plane.progress += 0.002;
        if (plane.progress > 1) plane.progress = 0;
        
        const point = plane.curve.getPointAt(plane.progress);
        plane.mesh.position.copy(point);
        
        // Orientation de l'avion
        if (plane.progress < 1) {
            const nextPoint = plane.curve.getPointAt(Math.min(plane.progress + 0.01, 1));
            plane.mesh.lookAt(nextPoint);
        }
    });
    
    mapControls.update();
    mapRenderer.render(mapScene, mapCamera);
}

// Gestion du redimensionnement
window.addEventListener('resize', onMapResize, false);

function onMapResize() {
    mapCamera.aspect = window.innerWidth / window.innerHeight;
    mapCamera.updateProjectionMatrix();
    mapRenderer.setSize(window.innerWidth, window.innerHeight);
}

function clearFlightPaths() {
    // Supprime tous les chemins de vol et avions existants
    flightPaths.forEach(path => mapScene.remove(path));
    planes.forEach(plane => mapScene.remove(plane.mesh));
    flightPaths = [];
    planes = [];
}

// Mise à jour des destinations possibles
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

// Mise à jour des escales possibles
function updateEscaleOptions(departure, destination) {
    const escaleSelect = document.getElementById('escale');
    escaleSelect.innerHTML = '<option value="">Vol direct</option>';
    
    if (departure && destination) {
        const possibleStops = findPossibleStops(departure, destination);
        possibleStops.forEach(stop => {
            const option = document.createElement('option');
            option.value = stop;
            option.textContent = `${airports[stop].name} (${stop})`;
            escaleSelect.appendChild(option);
        });
    }
}

function visualizeFlight(departure, destination, escale = null) {
    clearFlightPaths();
    
    if (escale) {
        // Vol avec escale
        createFlight(
            airports[departure].lat, airports[departure].lon,
            airports[escale].lat, airports[escale].lon
        );
        createFlight(
            airports[escale].lat, airports[escale].lon,
            airports[destination].lat, airports[destination].lon
        );
    } else {
        // Vol direct
        createFlight(
            airports[departure].lat, airports[departure].lon,
            airports[destination].lat, airports[destination].lon
        );
    }
}

// Initialisation au chargement de la page
window.addEventListener('load', () => {
    initFlightMap();
    
    const departSelect = document.getElementById('depart');
    const destinationSelect = document.getElementById('destination');
    const escaleSelect = document.getElementById('escale');
    
    // Gestionnaire pour le changement de départ
    departSelect.addEventListener('change', (e) => {
        const departure = e.target.value;
        if (departure) {
            updateDestinations(departure);
            if (destinationSelect.value) {
                updateEscaleOptions(departure, destinationSelect.value);
                visualizeFlight(departure, destinationSelect.value);
            }
        }
    });
    
    // Gestionnaire pour le changement de destination
    destinationSelect.addEventListener('change', (e) => {
        const destination = e.target.value;
        const departure = departSelect.value;
        if (departure && destination) {
            updateEscaleOptions(departure, destination);
            visualizeFlight(departure, destination);
        }
    });
    
    // Gestionnaire pour le changement d'escale
    escaleSelect.addEventListener('change', (e) => {
        const departure = departSelect.value;
        const destination = destinationSelect.value;
        const escale = e.target.value;
        if (departure && destination) {
            visualizeFlight(departure, destination, escale);
        }
    });
});
