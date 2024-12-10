const multer = require('multer');
const path = require('path');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Déterminer le dossier de destination en fonction du type de contenu
        let uploadPath;
        if (req.path.includes('/offres')) {
            uploadPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'offres');
        } else if (req.path.includes('/destinations')) {
            uploadPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'destinations');
        } else if (req.path.includes('/groupes')) {
            uploadPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'gallery');
        } else {
            uploadPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'uploads');
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être une image'), false);
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

module.exports = upload;
