const axios = require('axios');

// Taux de change fixes (à mettre à jour régulièrement)
const exchangeRates = {
    'XOF': {
        'EUR': 0.00152, // 1 XOF = 0.00152 EUR
        'USD': 0.00166  // 1 XOF = 0.00166 USD
    },
    'EUR': {
        'XOF': 655.957, // 1 EUR = 655.957 XOF
        'USD': 1.09     // 1 EUR = 1.09 USD
    },
    'USD': {
        'XOF': 601.79,  // 1 USD = 601.79 XOF
        'EUR': 0.92     // 1 USD = 0.92 EUR
    }
};

async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return { amount: parseFloat(amount) };
    }

    try {
        // Si la conversion est directement disponible dans nos taux
        if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
            const convertedAmount = amount * exchangeRates[fromCurrency][toCurrency];
            return {
                amount: Math.round(convertedAmount * 100) / 100,
                rate: exchangeRates[fromCurrency][toCurrency]
            };
        }

        // Si nous devons passer par une conversion inverse
        if (exchangeRates[toCurrency] && exchangeRates[toCurrency][fromCurrency]) {
            const rate = 1 / exchangeRates[toCurrency][fromCurrency];
            const convertedAmount = amount * rate;
            return {
                amount: Math.round(convertedAmount * 100) / 100,
                rate: rate
            };
        }

        throw new Error('Conversion non supportée');
    } catch (error) {
        console.error('Erreur de conversion:', error);
        throw error;
    }
}

module.exports = { convertCurrency };
