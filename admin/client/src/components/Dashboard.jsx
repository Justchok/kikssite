import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Paper,
} from '@mui/material';

const Dashboard = () => {
  const [tab, setTab] = useState(0);
  const [offers, setOffers] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
  });
  const [newGallery, setNewGallery] = useState({
    title: '',
    images: [],
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.description || !newOffer.price) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const formData = new FormData();
    formData.append('title', newOffer.title);
    formData.append('description', newOffer.description);
    formData.append('price', newOffer.price.replace(/\s+/g, '')); // Enlever les espaces pour l'envoi
    if (newOffer.image) {
      formData.append('image', newOffer.image);
    }

    try {
      const response = await fetch('http://localhost:5002/api/offers', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setOffers([...offers, data]);
      setNewOffer({ title: '', description: '', price: '', image: null });
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de l\'offre');
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!newGallery.title || newGallery.images.length === 0) {
      alert('Veuillez ajouter un titre et au moins une image');
      return;
    }

    const formData = new FormData();
    formData.append('title', newGallery.title);
    newGallery.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('http://localhost:5002/api/gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setGalleries([...galleries, data]);
      setNewGallery({ title: '', images: [] });
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de la galerie');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Administration Kiks Travel
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tab label="Offres Spéciales" />
          <Tab label="Galerie" />
        </Tabs>

        <Box sx={{ mt: 4 }}>
          {tab === 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Ajouter une offre
              </Typography>
              <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
                <Box component="form" onSubmit={handleOfferSubmit}>
                  <TextField
                    fullWidth
                    label="Titre"
                    required
                    margin="normal"
                    value={newOffer.title}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, title: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    required
                    margin="normal"
                    multiline
                    rows={4}
                    value={newOffer.description}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, description: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Prix (XOF)"
                    required
                    margin="normal"
                    value={newOffer.price}
                    onChange={(e) => {
                      // Nettoyer l'entrée pour n'accepter que les chiffres
                      const value = e.target.value.replace(/[^\d]/g, '');
                      // Formater le nombre avec des espaces pour les milliers
                      const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                      setNewOffer({ ...newOffer, price: formattedValue });
                    }}
                    helperText="Exemple: 2 500 000 XOF"
                  />
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) =>
                        setNewOffer({ ...newOffer, image: e.target.files[0] })
                      }
                      style={{ display: 'none' }}
                      id="offer-image-upload"
                    />
                    <label htmlFor="offer-image-upload">
                      <Button variant="outlined" component="span">
                        Choisir une image
                      </Button>
                    </label>
                    {newOffer.image && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Image sélectionnée: {newOffer.image.name}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Ajouter l'offre
                  </Button>
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Offres existantes
              </Typography>
              <Grid container spacing={3}>
                {offers.map((offer) => (
                  <Grid item xs={12} sm={6} md={4} key={offer.id}>
                    <Card>
                      {offer.image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://localhost:5002${offer.image}`}
                          alt={offer.title}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6">{offer.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {offer.description}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                          {offer.price} XOF
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {tab === 1 && (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Ajouter une galerie
              </Typography>
              <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
                <Box component="form" onSubmit={handleGallerySubmit}>
                  <TextField
                    fullWidth
                    label="Titre"
                    required
                    margin="normal"
                    value={newGallery.title}
                    onChange={(e) =>
                      setNewGallery({ ...newGallery, title: e.target.value })
                    }
                  />
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <input
                      accept="image/*"
                      type="file"
                      multiple
                      onChange={(e) =>
                        setNewGallery({
                          ...newGallery,
                          images: Array.from(e.target.files),
                        })
                      }
                      style={{ display: 'none' }}
                      id="gallery-images-upload"
                    />
                    <label htmlFor="gallery-images-upload">
                      <Button variant="outlined" component="span">
                        Choisir des images
                      </Button>
                    </label>
                    {newGallery.images.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {newGallery.images.length} image(s) sélectionnée(s)
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Créer la galerie
                  </Button>
                </Box>
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Galeries existantes
              </Typography>
              <Grid container spacing={3}>
                {galleries.map((gallery) => (
                  <Grid item xs={12} sm={6} md={4} key={gallery.id}>
                    <Card>
                      {gallery.images[0] && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://localhost:5002${gallery.images[0]}`}
                          alt={gallery.title}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6">{gallery.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {gallery.images.length} image(s)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
