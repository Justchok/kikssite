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

async function sendSpecialOfferEmail(offerDetails, customerDetails) {
    try {
        // Email pour l'agence
        const agencyEmail = await resend.emails.send({
            from: 'Agence de Voyage <onboarding@resend.dev>',
            to: 'chok.kane@gmail.com',
            subject: 'Nouvelle réservation d\'offre spéciale',
            html: `
                <h2>Nouvelle réservation d'offre spéciale</h2>
                
                <h3>Coordonnées du client:</h3>
                <ul>
                    <li>Nom: ${customerDetails.name}</li>
                    <li>Email: ${customerDetails.email}</li>
                    <li>Téléphone: ${customerDetails.phone}</li>
                </ul>

                <h3>Détails de l'offre:</h3>
                <ul>
                    <li>Titre: ${offerDetails.title}</li>
                    <li>Description: ${offerDetails.description}</li>
                    <li>Prix: ${offerDetails.price} XOF</li>
                </ul>

                <p>Date de la réservation: ${new Date().toLocaleString()}</p>
            `
        });

        console.log('Email de notification envoyé à l\'agence avec succès !');
        console.log('ID du message:', agencyEmail.id);

        // Email pour le client
        const clientEmail = await resend.emails.send({
            from: 'Agence de Voyage <onboarding@resend.dev>',
            to: customerDetails.email,
            subject: 'Confirmation de votre réservation - Kiks Travel',
            html: `
                <h2>Cher(e) ${customerDetails.name},</h2>
                
                <p>Nous avons bien reçu votre demande de réservation pour l'offre spéciale suivante :</p>
                
                <h3>Détails de l'offre :</h3>
                <ul>
                    <li>Titre : ${offerDetails.title}</li>
                    <li>Description : ${offerDetails.description}</li>
                    <li>Prix : ${offerDetails.price} XOF</li>
                </ul>

                <p>Notre équipe va étudier votre demande et vous recontactera dans les plus brefs délais pour finaliser votre réservation.</p>

                <p>Cordialement,<br>L'équipe Kiks Travel</p>
            `
        });

        console.log('Email de confirmation envoyé au client avec succès !');
        console.log('ID du message:', clientEmail.id);

        return { agencyEmailId: agencyEmail.id, clientEmailId: clientEmail.id };

    } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
        if (error.response) {
            console.error('Détails de l\'erreur:', error.response);
        }
        throw error;
    }
}

// Exemple d'utilisation
const testSpecialOffer = {
    title: "Escapade à Paris",
    description: "Découvrez la ville lumière avec notre offre spéciale incluant vol + hôtel",
    price: "450 000"
};

const testCustomer = {
    name: "John Doe",
    email: "chok.kane@gmail.com",
    phone: "+1234567890"
};

// Test de la fonction d'envoi d'email pour les offres spéciales
sendSpecialOfferEmail(testSpecialOffer, testCustomer)
    .then(() => console.log('Test d\'envoi d\'emails pour offre spéciale réussi !'))
    .catch(error => console.error('Erreur lors du test:', error));

testEmail();
