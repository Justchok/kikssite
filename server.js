const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// Servir les fichiers statiques du dossier public
app.use(express.static('public'));

// Route principale qui renvoie index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur frontend démarré sur http://localhost:${PORT}`);
});
