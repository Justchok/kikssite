require('dotenv').config({ path: './env.config' });
const { Resend } = require('resend');

// Configuration de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    try {
        // Email pour l'agence
        const agencyEmail = await resend.emails.send({
            from: 'Agence de Voyage <onboarding@resend.dev>',
            to: 'chok.kane@gmail.com',
            subject: 'Test - Nouvelle réservation de voyage',
            html: `
                <h2>Test - Nouvelle réservation de voyage</h2>
                
                <h3>Coordonnées:</h3>
                <ul>
                    <li>Nom: Test Utilisateur</li>
                    <li>Email: chok.kane@gmail.com</li>
                    <li>Téléphone: +1234567890</li>
                </ul>

                <h3>Détails du voyage:</h3>
                <ul>
                    <li>Lieu de départ: Paris</li>
                    <li>Destination: Tokyo</li>
                    <li>Escales: Dubai</li>
                    <li>Date de départ: 2024-02-01</li>
                    <li>Date de retour: 2024-02-15</li>
                    <li>Classe: Affaires</li>
                </ul>

                <h3>Message supplémentaire:</h3>
                <p>Ceci est un test d'envoi d'email via Resend</p>

                <p>Date de la réservation: ${new Date().toLocaleString()}</p>
            `
        });

        console.log('Email de test envoyé avec succès !');
        console.log('ID du message:', agencyEmail.id);

        // Email pour le client
        const clientEmail = await resend.emails.send({
            from: 'Agence de Voyage <onboarding@resend.dev>',
            to: 'chok.kane@gmail.com',
            subject: 'Test - Confirmation de votre demande de réservation',
            html: `
                <h2>Cher(e) Test Utilisateur,</h2>
                
                <p>Nous avons bien reçu votre demande de réservation pour votre voyage.</p>
                
                <h3>Récapitulatif de votre demande :</h3>
                <ul>
                    <li>Lieu de départ : Paris</li>
                    <li>Destination : Tokyo</li>
                    <li>Escales : Dubai</li>
                    <li>Date de départ : 2024-02-01</li>
                    <li>Date de retour : 2024-02-15</li>
                    <li>Classe : Affaires</li>
                </ul>

                <p>Notre équipe va étudier votre demande et vous recontactera dans les plus brefs délais.</p>

                <p>Cordialement,<br>Votre agence de voyage</p>
            `
        });

        console.log('Email de confirmation envoyé avec succès !');
        console.log('ID du message:', clientEmail.id);

    } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
        if (error.response) {
            console.error('Détails de l\'erreur:', error.response);
        }
    }
}

testEmail();
