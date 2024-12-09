const express = require('express');
const path = require('path');
const cors = require('cors');
const { sendBookingConfirmation } = require('./email');
const dotenv = require('dotenv');

// Charger la configuration depuis env.config
dotenv.config({ path: path.join(__dirname, '..', 'env.config') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Route pour gérer les réservations
app.post('/api/booking', async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Envoyer l'email de confirmation
        const emailResult = await sendBookingConfirmation(bookingData);
        
        if (emailResult.success) {
            res.status(200).json({ 
                message: 'Réservation reçue avec succès',
                emailSent: true 
            });
        } else {
            throw new Error(emailResult.error || 'Erreur lors de l\'envoi de l\'email');
        }
    } catch (error) {
        console.error('Erreur de réservation:', error);
        res.status(500).json({ 
            message: 'Erreur lors du traitement de la réservation',
            error: error.message 
        });
    }
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log('Configuration chargée depuis env.config');
    console.log('Clé API Resend:', process.env.RESEND_API_KEY ? 'Configurée' : 'Non configurée');
});
