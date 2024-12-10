const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config({ path: './env.config' });

const app = express();
const port = process.env.PORT || 3000;

// Configuration de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static('public')); // Servir les fichiers du dossier public
app.use('/admin', express.static('admin')); // Servir les fichiers du dossier admin

// Route pour l'envoi d'email
app.post('/api/send-email', async (req, res) => {
    console.log('Réception d\'une nouvelle demande de réservation:', req.body);
    try {
        const {
            nom,
            email,
            telephone,
            lieuDepart,
            destination,
            escales,
            dateDepart,
            dateRetour,
            classe,
            passagers
        } = req.body;

        console.log('Envoi de l\'email à l\'agence...');
        // Email pour l'agence
        await resend.emails.send({
            from: 'Kiks Travel <onboarding@resend.dev>',
            to: process.env.EMAIL_TO,
            subject: 'Nouvelle réservation de voyage',
            html: `
                <h2>Nouvelle réservation de voyage</h2>
                
                <h3>Coordonnées:</h3>
                <ul>
                    <li>Nom: ${nom}</li>
                    <li>Email: ${email}</li>
                    <li>Téléphone: ${telephone || 'Non spécifié'}</li>
                </ul>

                <h3>Détails du voyage:</h3>
                <ul>
                    <li>Lieu de départ: ${lieuDepart}</li>
                    <li>Destination: ${destination}</li>
                    <li>Escales: ${escales || 'Vol direct'}</li>
                    <li>Date de départ: ${dateDepart}</li>
                    <li>Date de retour: ${dateRetour}</li>
                    <li>Classe: ${classe}</li>
                    <li>Nombre de passagers: ${passagers}</li>
                </ul>
            `
        });
        console.log('Email envoyé à l\'agence avec succès');

        console.log('Envoi de l\'email de confirmation au client...');
        // Email pour le client
        await resend.emails.send({
            from: 'Kiks Travel <onboarding@resend.dev>',
            to: email,
            subject: 'Confirmation de votre demande de réservation',
            html: `
                <h2>Cher(e) ${nom},</h2>
                
                <p>Nous avons bien reçu votre demande de réservation pour votre voyage.</p>
                
                <h3>Récapitulatif de votre demande :</h3>
                <ul>
                    <li>Lieu de départ : ${lieuDepart}</li>
                    <li>Destination : ${destination}</li>
                    <li>Escales : ${escales || 'Vol direct'}</li>
                    <li>Date de départ : ${dateDepart}</li>
                    <li>Date de retour : ${dateRetour}</li>
                    <li>Classe : ${classe}</li>
                    <li>Nombre de passagers : ${passagers}</li>
                </ul>

                <p>Notre équipe va étudier votre demande et vous recontactera dans les plus brefs délais.</p>

                <p>Cordialement,<br>L'équipe Kiks Travel</p>
            `
        });
        console.log('Email de confirmation envoyé au client avec succès');

        res.status(200).json({ message: 'Emails envoyés avec succès' });
    } catch (error) {
        console.error('Erreur détaillée lors de l\'envoi des emails:', error);
        res.status(500).json({ 
            message: 'Erreur lors de l\'envoi des emails',
            error: error.message 
        });
    }
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
