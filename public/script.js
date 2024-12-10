// Gestion du menu burger
document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');

    burgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Fermer le menu lors du clic sur un lien
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Défilement fluide pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animation du header au scroll
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Gestion du formulaire de contact
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Message envoyé ! Nous vous répondrons dans les plus brefs délais.');
            contactForm.reset();
        });
    }

    // Gestion du formulaire de réservation
    const form = document.getElementById('reservation-form');
    const addEscaleBtn = document.getElementById('add-escale');
    const escalesList = document.querySelector('.escales-list');

    if (form && addEscaleBtn && escalesList) {
        // Gestion des escales
        addEscaleBtn.addEventListener('click', () => {
            const newEscale = document.createElement('div');
            newEscale.className = 'escale-input';
            newEscale.innerHTML = `
                <input type="text" name="escales[]" placeholder="Ville d'escale (optionnel)">
                <button type="button" class="remove-escale" aria-label="Supprimer l'escale">×</button>
            `;
            
            newEscale.querySelector('.remove-escale').addEventListener('click', () => {
                newEscale.remove();
            });

            escalesList.appendChild(newEscale);
        });

        // Validation des dates
        const dateDepart = document.getElementById('date-depart');
        const dateRetour = document.getElementById('date-retour');

        if (dateDepart && dateRetour) {
            dateDepart.addEventListener('change', () => {
                dateRetour.min = dateDepart.value;
                if (dateRetour.value && dateRetour.value < dateDepart.value) {
                    dateRetour.value = dateDepart.value;
                }
            });
        }

        // Gestion de la soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const escales = Array.from(form.querySelectorAll('input[name="escales[]"]'))
                    .map(input => input.value)
                    .filter(value => value.trim() !== '');

                const formData = {
                    nom: form.nom.value,
                    email: form.email.value,
                    telephone: form.telephone.value,
                    lieuDepart: form.lieuDepart.value,
                    destination: form.destination.value,
                    escales: escales,
                    dateDepart: form.querySelector('#date-depart').value,
                    dateRetour: form.querySelector('#date-retour').value,
                    classe: form.classe.value,
                    message: form.message.value
                };

                console.log('Envoi des données:', formData);

                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const responseData = await response.json();
                console.log('Réponse du serveur:', responseData);

                if (!response.ok) {
                    throw new Error(responseData.message || 'Erreur lors de l\'envoi de la réservation');
                }

                // Afficher le pop-up de confirmation
                const popup = document.getElementById('confirmation-popup');
                if (popup) {
                    popup.style.display = 'flex';
                }

                // Réinitialiser le formulaire
                form.reset();

                // Supprimer les champs d'escale supplémentaires
                const escaleInputs = document.querySelectorAll('.escale-input');
                for (let i = 1; i < escaleInputs.length; i++) {
                    escaleInputs[i].remove();
                }
            } catch (error) {
                console.error('Erreur détaillée:', error);
                alert('Une erreur est survenue lors de l\'envoi de votre réservation. Veuillez réessayer plus tard.');
            }
        });
    }

    // Gestion du formulaire de réservation
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Vérification des champs requis
            const requiredFields = ['name', 'email', 'departure', 'destination', 'departure-date', 'return-date', 'travel-class', 'passengers'];
            const missingFields = requiredFields.filter(field => !document.getElementById(field).value.trim());
            
            if (missingFields.length > 0) {
                Swal.fire({
                    title: 'Champs manquants',
                    text: 'Veuillez remplir tous les champs obligatoires',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
            
            // Afficher un indicateur de chargement
            Swal.fire({
                title: 'Envoi en cours...',
                text: 'Veuillez patienter pendant que nous traitons votre demande',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const formData = {
                nom: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('telephone')?.value.trim() || '',
                lieuDepart: document.getElementById('departure').value,
                destination: document.getElementById('destination').value,
                escales: document.getElementById('layover').value || 'Vol direct',
                dateDepart: document.getElementById('departure-date').value,
                dateRetour: document.getElementById('return-date').value,
                classe: document.getElementById('travel-class').value,
                passagers: document.getElementById('passengers').value
            };

            try {
                console.log('Envoi des données:', formData);
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                console.log('Réponse du serveur:', data);

                if (response.ok) {
                    Swal.fire({
                        title: 'Réservation envoyée !',
                        text: 'Nous vous contacterons bientôt pour confirmer votre réservation.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    bookingForm.reset();
                } else {
                    throw new Error(data.error || 'Erreur lors de l\'envoi');
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi:', error);
                Swal.fire({
                    title: 'Erreur',
                    text: error.message || 'Une erreur est survenue lors de l\'envoi de votre réservation. Veuillez réessayer.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });

        // Remplir les sélecteurs d'aéroports
        const airports = {
            'DSS': 'Dakar (DSS)',
            'CDG': 'Paris (CDG)',
            'DXB': 'Dubai (DXB)',
            'JFK': 'New York (JFK)',
            'LHR': 'Londres (LHR)',
            'IST': 'Istanbul (IST)',
            'CMN': 'Casablanca (CMN)',
            'CAI': 'Le Caire (CAI)',
            'JED': 'Jeddah (JED)',
            'MED': 'Médine (MED)'
        };

        const departureSelect = document.getElementById('departure');
        const destinationSelect = document.getElementById('destination');
        const layoverSelect = document.getElementById('layover');

        // Fonction pour remplir un sélecteur avec les aéroports
        function fillAirportSelect(select) {
            select.innerHTML = '<option value="">Sélectionnez un aéroport</option>';
            Object.entries(airports).forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                select.appendChild(option);
            });
        }

        fillAirportSelect(departureSelect);
        fillAirportSelect(destinationSelect);
        fillAirportSelect(layoverSelect);
    }

    // Fonction pour fermer le pop-up
    window.closePopup = function() {
        const popup = document.getElementById('confirmation-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    };

    // Animation des cartes de service
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });

    // Données de la galerie
    const galerieImages = [
        { 
            src: 'assets/images/voyage1.jpg',
            titre: 'Voyage à Paris',
            date: 'Juin 2023'
        },
        { 
            src: 'assets/images/voyage2.jpg',
            titre: 'Escapade à Londres',
            date: 'Août 2023'
        },
        { 
            src: 'assets/images/voyage3.jpg',
            titre: 'Tour de Tokyo',
            date: 'Octobre 2023'
        },
        { 
            src: 'assets/images/voyage4.jpg',
            titre: 'Découverte de New York',
            date: 'Décembre 2023'
        }
    ];

    // Création de la galerie
    function creerGalerie() {
        const galerieGrid = document.querySelector('.galerie-grid');
        if (!galerieGrid) return;

        // Créer le modal une seule fois
        const modal = document.createElement('div');
        modal.className = 'modal';
        document.body.appendChild(modal);

        galerieImages.forEach(img => {
            const item = document.createElement('div');
            item.className = 'galerie-item';
            
            item.innerHTML = `
                <img src="${img.src}" alt="${img.titre}">
                <div class="overlay">
                    <h3>${img.titre}</h3>
                    <p>${img.date}</p>
                </div>
            `;

            // Ajouter l'événement pour ouvrir le modal
            item.addEventListener('click', () => {
                modal.innerHTML = `<img src="${img.src}" alt="${img.titre}">`;
                modal.classList.add('active');
            });

            galerieGrid.appendChild(item);
        });

        // Fermer le modal en cliquant dessus
        modal.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Initialiser la galerie au chargement de la page
    creerGalerie();

    // Animation au scroll pour la galerie
    const observerOptions2 = {
        threshold: 0.1
    };

    const observer2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions2);

    document.querySelectorAll('.galerie-item').forEach(el => {
        observer2.observe(el);
    });

    // Charger les offres spéciales
    async function loadOffresSpeciales() {
        try {
            const response = await fetch('/api/offres');
            const offres = await response.json();
            
            const offresContainer = document.querySelector('#offres-speciales .offres-container');
            if (!offresContainer) return;

            const offresHTML = offres.map(offre => `
                <div class="offre-card">
                    <img src="${offre.image}" alt="${offre.titre}">
                    <div class="offre-content">
                        <h3>${offre.titre}</h3>
                        <p>${offre.description}</p>
                        <div class="prix-container">
                            <span class="prix">${offre.prix.toLocaleString('fr-FR')} ${offre.devise}</span>
                            <select class="devise-select" onchange="convertirPrix(this, ${offre.prix}, '${offre.devise}')">
                                <option value="${offre.devise}" selected>${offre.devise}</option>
                                <option value="XOF" ${offre.devise === 'XOF' ? 'hidden' : ''}>XOF</option>
                                <option value="EUR" ${offre.devise === 'EUR' ? 'hidden' : ''}>EUR</option>
                                <option value="USD" ${offre.devise === 'USD' ? 'hidden' : ''}>USD</option>
                            </select>
                        </div>
                        <button class="btn-reserver" onclick="ouvrirFormulaire('${offre.titre}')">Réserver</button>
                    </div>
                </div>
            `).join('');
            
            offresContainer.innerHTML = offresHTML;
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
        }
    }

    // Charger les destinations populaires
    async function loadDestinations() {
        try {
            const response = await fetch('/api/destinations');
            const destinations = await response.json();
            
            const destinationsContainer = document.querySelector('#destinations-populaires .destinations-container');
            if (!destinationsContainer) return;

            const destinationsHTML = destinations.map(destination => `
                <div class="destination-card">
                    <img src="${destination.image}" alt="${destination.titre}">
                    <div class="destination-content">
                        <h3>${destination.titre}</h3>
                        <p>${destination.description}</p>
                        <div class="prix-container">
                            <span class="prix">${destination.prix.toLocaleString('fr-FR')} ${destination.devise}</span>
                            <select class="devise-select" onchange="convertirPrix(this, ${destination.prix}, '${destination.devise}')">
                                <option value="${destination.devise}" selected>${destination.devise}</option>
                                <option value="XOF" ${destination.devise === 'XOF' ? 'hidden' : ''}>XOF</option>
                                <option value="EUR" ${destination.devise === 'EUR' ? 'hidden' : ''}>EUR</option>
                                <option value="USD" ${destination.devise === 'USD' ? 'hidden' : ''}>USD</option>
                            </select>
                        </div>
                        <button class="btn-reserver" onclick="ouvrirFormulaire('${destination.titre}')">Réserver</button>
                    </div>
                </div>
            `).join('');
            
            destinationsContainer.innerHTML = destinationsHTML;
        } catch (error) {
            console.error('Erreur lors du chargement des destinations:', error);
        }
    }

    // Charger les voyages de groupe
    async function loadVoyagesGroupe() {
        try {
            const response = await fetch('/api/groupes');
            const groupes = await response.json();
            
            const groupesContainer = document.querySelector('#voyages-groupe .groupes-container');
            if (!groupesContainer) return;

            const groupesHTML = groupes.map(groupe => `
                <div class="groupe-card">
                    <img src="${groupe.image}" alt="${groupe.titre}">
                    <div class="groupe-content">
                        <h3>${groupe.titre}</h3>
                        <p>${groupe.description}</p>
                        <p><strong>Date de départ:</strong> ${new Date(groupe.dateDepart).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Durée:</strong> ${groupe.duree}</p>
                        <div class="prix-container">
                            <span class="prix">${groupe.prix.toLocaleString('fr-FR')} ${groupe.devise}</span>
                            <select class="devise-select" onchange="convertirPrix(this, ${groupe.prix}, '${groupe.devise}')">
                                <option value="${groupe.devise}" selected>${groupe.devise}</option>
                                <option value="XOF" ${groupe.devise === 'XOF' ? 'hidden' : ''}>XOF</option>
                                <option value="EUR" ${groupe.devise === 'EUR' ? 'hidden' : ''}>EUR</option>
                                <option value="USD" ${groupe.devise === 'USD' ? 'hidden' : ''}>USD</option>
                            </select>
                        </div>
                        <button class="btn-reserver" onclick="ouvrirFormulaire('${groupe.titre}')">Réserver</button>
                    </div>
                </div>
            `).join('');
            
            groupesContainer.innerHTML = groupesHTML;
        } catch (error) {
            console.error('Erreur lors du chargement des voyages de groupe:', error);
        }
    }

    // Fonction pour charger les voyages de groupe
    async function loadGroupes() {
        try {
            const response = await fetch('/api/groupes');
            const groupes = await response.json();
            const container = document.getElementById('groupes-container');
            
            if (container) {
                container.innerHTML = groupes.map(groupe => `
                    <div class="col-lg-3 col-md-4 col-sm-6 gallery-item">
                        <div class="gallery-wrap">
                            <img src="${groupe.image}" class="img-fluid" alt="${groupe.titre}">
                            <div class="gallery-info">
                                <h4>${groupe.titre}</h4>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des voyages de groupe:', error);
        }
    }

    // Fonction de conversion des prix
    async function convertirPrix(selectElement, montant, deviseOrigine) {
        const deviseDestination = selectElement.value;
        if (deviseOrigine === deviseDestination) return;

        try {
            const response = await fetch(`/api/convert-currency?amount=${montant}&from=${deviseOrigine}&to=${deviseDestination}`);
            const data = await response.json();
            
            const prixElement = selectElement.parentElement.querySelector('.prix');
            prixElement.textContent = `${data.amount.toLocaleString('fr-FR')} ${deviseDestination}`;
        } catch (error) {
            console.error('Erreur de conversion:', error);
            alert('Erreur lors de la conversion de la devise');
        }
    }

    // Charger tout le contenu au chargement de la page
    loadOffresSpeciales();
    loadDestinations();
    loadVoyagesGroupe();
    loadGroupes();
});
