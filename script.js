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
});
