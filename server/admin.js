const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configuration de multer pour le téléchargement d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.path.split('/')[1]; // offres, destinations, ou groupes
        const dir = path.join(__dirname, '..', 'assets', 'images', type);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) return res.status(401).json({ message: 'Non authentifié' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
};

// Route de connexion
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Vérifier les identifiants (à remplacer par une vraie base de données)
    if (username === process.env.ADMIN_USERNAME && 
        await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
        
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('adminToken', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });
        
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true });
});

// Routes pour les offres spéciales
router.get('/offres', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'offres.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la lecture des offres' });
    }
});

router.post('/offres', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { titre, description, prix } = req.body;
        const imagePath = req.file ? `/assets/images/offres/${req.file.filename}` : null;
        
        const data = await fs.readFile(path.join(__dirname, 'data', 'offres.json'), 'utf8');
        const offres = JSON.parse(data);
        
        offres.push({
            id: Date.now(),
            titre,
            description,
            prix,
            image: imagePath
        });
        
        await fs.writeFile(path.join(__dirname, 'data', 'offres.json'), JSON.stringify(offres, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'offre' });
    }
});

// Routes similaires pour les destinations
router.get('/destinations', authenticateToken, async (req, res) => {
    // Similar to /offres route
});

router.post('/destinations', authenticateToken, upload.single('image'), async (req, res) => {
    // Similar to /offres route
});

// Routes similaires pour les voyages de groupe
router.get('/groupes', authenticateToken, async (req, res) => {
    // Similar to /offres route
});

router.post('/groupes', authenticateToken, upload.single('image'), async (req, res) => {
    // Similar to /offres route
});

module.exports = router;
