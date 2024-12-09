const { Resend } = require('resend');
const path = require('path');
const dotenv = require('dotenv');

// Charger la configuration depuis env.config
dotenv.config({ path: path.join(__dirname, '..', 'env.config') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBookingConfirmation(bookingData) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Kiks Travel <reservation@kikstravel.com>',
            to: [bookingData.email],
            subject: 'Confirmation de votre demande de réservation - Kiks Travel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2c3e50;">Merci pour votre demande de réservation!</h1>
                    
                    <p>Cher(e) ${bookingData.name},</p>
                    
                    <p>Nous avons bien reçu votre demande de réservation avec les détails suivants :</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Départ:</strong> ${bookingData.departure}</p>
                        ${bookingData.layover ? `<p><strong>Escale:</strong> ${bookingData.layover}</p>` : ''}
                        <p><strong>Destination:</strong> ${bookingData.destination}</p>
                        <p><strong>Date de départ:</strong> ${bookingData.departureDate}</p>
                        <p><strong>Date de retour:</strong> ${bookingData.returnDate}</p>
                        <p><strong>Classe:</strong> ${bookingData.travelClass}</p>
                        <p><strong>Nombre de passagers:</strong> ${bookingData.passengers}</p>
                    </div>
                    
                    <p>Notre équipe va étudier votre demande et vous contactera dans les plus brefs délais avec nos meilleures offres personnalisées.</p>
                    
                    <p style="margin-top: 30px;">Cordialement,<br>L'équipe Kiks Travel</p>
                </div>
            `
        });

        if (error) {
            console.error('Erreur Resend:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erreur d\'envoi d\'email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendBookingConfirmation
};
