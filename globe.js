// Globe 3D
let scene, camera, renderer, controls, earth;

function init() {
    // Création de la scène
    scene = new THREE.Scene();

    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    // Configuration du rendu
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const container = document.getElementById('globe-container');
    
    if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        renderer.setSize(containerWidth, containerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Création de la Terre avec texture
        const geometry = new THREE.SphereGeometry(80, 64, 64);
        const texture = new THREE.TextureLoader().load('assets/images/earth-map.jpg');
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // Ajout de l'éclairage
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(100, 100, 100);
        scene.add(pointLight);

        // Configuration des contrôles
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.minDistance = 150;
        controls.maxDistance = 400;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1;

        // Gestion du redimensionnement
        window.addEventListener('resize', onWindowResize, false);

        // Démarrage de l'animation
        animate();
    }
}

function onWindowResize() {
    const container = document.getElementById('globe-container');
    if (container && camera && renderer) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (earth && controls) {
        earth.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
    }
}

// Initialisation lors du chargement de la page
document.addEventListener('DOMContentLoaded', init);
