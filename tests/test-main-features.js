require('dotenv').config({ path: '../env.config' });
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE_URL = 'http://localhost:5002/api';

async function testGetOffers() {
    console.log('\n🔍 Test: Récupération des offres spéciales');
    try {
        const response = await axios.get(`${API_BASE_URL}/offers`);
        console.log('✅ Succès: Liste des offres récupérée');
        console.log(`📊 Nombre d'offres: ${response.data.length}`);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des offres:', error.message);
        throw error;
    }
}

async function testGetGallery() {
    console.log('\n🔍 Test: Récupération de la galerie');
    try {
        const response = await axios.get(`${API_BASE_URL}/gallery`);
        console.log('✅ Succès: Galerie récupérée');
        console.log(`📊 Nombre d'images: ${response.data.length}`);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la galerie:', error.message);
        throw error;
    }
}

async function testBookOffer(offer) {
    console.log('\n🔍 Test: Réservation d\'une offre spéciale');
    try {
        const bookingData = {
            name: 'Test Client',
            email: 'chok.kane@gmail.com',
            phone: '+1234567890',
            offerTitle: offer.title,
            offerId: offer.id
        };

        console.log('📝 Données de réservation:', bookingData);
        const response = await axios.post(`${API_BASE_URL}/public/book-offer`, bookingData);
        console.log('✅ Succès: Réservation d\'offre effectuée');
        console.log('📧 IDs des emails envoyés:', response.data.emailIds);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('❌ Erreur lors de la réservation de l\'offre:', error.response.data.error);
            console.error('📊 Status:', error.response.status);
            console.error('🔍 Détails:', error.response.data);
        } else {
            console.error('❌ Erreur lors de la réservation de l\'offre:', error.message);
        }
        throw error;
    }
}

async function testBookFlight() {
    console.log('\n🔍 Test: Réservation d\'un vol');
    try {
        const flightData = {
            name: 'Test Client',
            email: 'chok.kane@gmail.com',
            phone: '+1234567890',
            departure: 'Paris',
            destination: 'Dubai',
            layover: 'Istanbul',
            travelClass: 'Affaires',
            departureDate: '2024-02-01',
            returnDate: '2024-02-15',
            passengers: 2
        };

        const response = await axios.post(`${API_BASE_URL}/public/book-flight`, flightData);
        console.log('✅ Succès: Réservation de vol effectuée');
        console.log('📧 IDs des emails envoyés:', response.data.emailIds);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('❌ Erreur lors de la réservation du vol:', error.response.data.error);
            console.error('📊 Status:', error.response.status);
            console.error('🔍 Détails:', error.response.data);
        } else {
            console.error('❌ Erreur lors de la réservation du vol:', error.message);
        }
        throw error;
    }
}

async function runAllTests() {
    console.log('🚀 Démarrage des tests des fonctionnalités principales');
    try {
        // Test 1: Récupération des offres
        const offers = await testGetOffers();
        
        // Test 2: Récupération de la galerie
        const gallery = await testGetGallery();
        
        // Test 3: Réservation d'une offre (si des offres existent)
        if (offers && offers.length > 0) {
            await testBookOffer(offers[0]);
        } else {
            console.log('⚠️ Aucune offre disponible pour tester la réservation');
        }
        
        // Test 4: Réservation d'un vol
        await testBookFlight();

        console.log('\n✨ Tous les tests ont été exécutés avec succès!');
    } catch (error) {
        console.error('\n❌ Erreur lors de l\'exécution des tests:', error.message);
        process.exit(1);
    }
}

// Exécuter tous les tests
runAllTests();
