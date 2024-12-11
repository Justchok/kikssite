const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { sendSpecialOfferEmail, sendFlightBookingEmail } = require('./emailService');

const app = express();
const PORT = 5002;

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes publiques pour le site principal
app.get('/api/public/offers', async (req, res) => {
  try {
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'offers.json'), 'utf8');
    const offers = JSON.parse(data);
    // Filtrer les offres pour ne renvoyer que celles qui sont complètes
    const validOffers = offers.filter(offer => 
      offer.title && 
      offer.description && 
      offer.price
    );
    res.json(validOffers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des offres' });
  }
});

app.get('/api/public/gallery', async (req, res) => {
  try {
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'gallery.json'), 'utf8');
    const galleries = JSON.parse(data);
    // Filtrer les galeries pour ne renvoyer que celles qui sont complètes
    const validGalleries = galleries.filter(gallery => 
      gallery.title && 
      gallery.images && 
      gallery.images.length > 0
    );
    res.json(validGalleries);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture de la galerie' });
  }
});

// Routes pour l'authentification
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') {
    res.json({ success: true, token: 'admin-token' });
  } else {
    res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
  }
});

// Routes pour les offres
app.get('/api/offers', async (req, res) => {
  try {
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'offers.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des offres' });
  }
});

app.post('/api/offers', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'offers.json'), 'utf8');
    const offers = JSON.parse(data);
    
    const newOffer = {
      id: Date.now().toString(),
      title,
      description,
      price,
      image: imagePath
    };
    
    offers.push(newOffer);
    await fsPromises.writeFile(path.join(__dirname, 'data', 'offers.json'), JSON.stringify(offers, null, 2));
    
    res.json(newOffer);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'offre' });
  }
});

// Routes pour la galerie
app.get('/api/gallery', async (req, res) => {
  try {
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'gallery.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture de la galerie' });
  }
});

app.post('/api/gallery', upload.array('images', 10), async (req, res) => {
  try {
    const { title } = req.body;
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const data = await fsPromises.readFile(path.join(__dirname, 'data', 'gallery.json'), 'utf8');
    const galleries = JSON.parse(data);
    
    const newGallery = {
      id: Date.now().toString(),
      title,
      images: imagePaths
    };
    
    galleries.push(newGallery);
    await fsPromises.writeFile(path.join(__dirname, 'data', 'gallery.json'), JSON.stringify(galleries, null, 2));
    
    res.json(newGallery);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la galerie' });
  }
});

// Route pour envoyer un email de réservation d'offre spéciale
app.post('/api/public/book-offer', async (req, res) => {
    try {
        const { name, email, phone, offerTitle, offerId } = req.body;

        // Lire le fichier des offres pour obtenir les détails complets
        const offersData = await fsPromises.readFile(path.join(__dirname, 'data', 'offers.json'), 'utf8');
        const offers = JSON.parse(offersData);
        const offer = offers.find(o => o.id === offerId);

        if (!offer) {
            return res.status(404).json({ 
                error: 'Offre non trouvée',
                details: { offerId, offerTitle }
            });
        }

        // Envoyer les emails avec Resend
        const emailResult = await sendSpecialOfferEmail(
            {
                title: offer.title,
                description: offer.description,
                price: offer.price
            },
            {
                name,
                email,
                phone
            }
        );

        res.json({ 
            success: true, 
            emailIds: emailResult,
            offer: {
                id: offer.id,
                title: offer.title
            }
        });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'envoi des emails',
            details: error.message
        });
    }
});

// Route pour envoyer un email de réservation de vol
app.post('/api/public/book-flight', async (req, res) => {
    try {
        const {
            name,
            email,
            flightDetails
        } = req.body;

        if (!name || !email || !flightDetails || 
            !flightDetails.departure || !flightDetails.destination || 
            !flightDetails.departureDate || !flightDetails.returnDate) {
            return res.status(400).json({
                error: 'Données manquantes',
                details: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        // Envoyer les emails avec Resend
        const emailResult = await sendFlightBookingEmail({
            name,
            email,
            flightDetails
        });

        res.json({ 
            success: true, 
            emailIds: emailResult
        });
    } catch (error) {
        console.error('Erreur lors de la réservation de vol:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'envoi des emails',
            details: error.message
        });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
