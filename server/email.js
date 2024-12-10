const { Resend } = require('resend');
const path = require('path');
const dotenv = require('dotenv');

// Charger la configuration depuis env.config
dotenv.config({ path: path.join(__dirname, '..', 'env.config') });

// Vérifier la clé API
const apiKey = process.env.RESEND_API_KEY;
console.log('API Key configurée:', apiKey ? 'Oui' : 'Non');

if (!apiKey) {
    console.error('Erreur: RESEND_API_KEY n\'est pas configurée');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function sendBookingConfirmation(bookingData) {
    try {
        console.log('Tentative d\'envoi d\'email avec Resend...');
        console.log('Données de réservation:', bookingData);

        // Utiliser l'adresse email de test de Resend
        const emailData = {
            from: 'onboarding@resend.dev',
            to: ['delivered@resend.dev', bookingData.email], // Ajouter l'adresse de test
            subject: 'Test - Confirmation de réservation Kiks Travel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2c3e50;">Test - Merci pour votre demande de réservation!</h1>
                    
                    <p>Cher(e) ${bookingData.name},</p>
                    
                    <p>Ceci est un email de test. Nous avons reçu votre demande avec les détails suivants :</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Départ:</strong> ${bookingData.departure}</p>
                        ${bookingData.layover ? `<p><strong>Escale:</strong> ${bookingData.layover}</p>` : ''}
                        <p><strong>Destination:</strong> ${bookingData.destination}</p>
                        <p><strong>Date de départ:</strong> ${bookingData.departureDate}</p>
                        <p><strong>Date de retour:</strong> ${bookingData.returnDate}</p>
                        <p><strong>Classe:</strong> ${bookingData.travelClass}</p>
                        <p><strong>Nombre de passagers:</strong> ${bookingData.passengers}</p>
                    </div>
                    
                    <p>Notre équipe va étudier votre demande et vous contactera dans les plus brefs délais.</p>
                    
                    <p style="margin-top: 30px;">Cordialement,<br>L'équipe Kiks Travel</p>
                </div>
            `
        };

        console.log('Configuration email:', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject
        });

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('Erreur Resend:', error);
            return { success: false, error: error.message };
        }

        console.log('Email envoyé avec succès:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Erreur d\'envoi d\'email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendBookingConfirmation };
