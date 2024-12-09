// Globe 3D
let scene, camera, renderer, globe;

function init() {
    // Création de la scène
    scene = new THREE.Scene();

    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    // Configuration du renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    const container = document.getElementById('globe-container');
    container.appendChild(renderer.domElement);

    // Création du globe
    const geometry = new THREE.SphereGeometry(100, 64, 64);
    const texture = new THREE.TextureLoader().load('assets/images/earth-map.jpg');
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Ajout de lumière
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Animation
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.002;
    renderer.render(scene, camera);
}

// Gestion du redimensionnement
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialisation au chargement de la page
window.addEventListener('load', init);
