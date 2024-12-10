// Gestion de la navigation
document.addEventListener('DOMContentLoaded', () => {
    // Gérer la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id !== 'logoutBtn') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Retirer la classe active de tous les liens
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                // Ajouter la classe active au lien cliqué
                link.classList.add('active');
                
                // Cacher toutes les sections
                document.querySelectorAll('[id$="-section"]').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Afficher la section correspondante
                const sectionId = link.getAttribute('data-section') + '-section';
                document.getElementById(sectionId).style.display = 'block';
            });
        }
    });

    // Gérer la déconnexion
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            window.location.href = '/admin/login.html';
        }
    });

    // Charger le contenu initial
    loadOffres();
    loadGroupes();
});

// Fonction pour ajouter une offre
async function showAddOffreForm() {
    const { value: formValues } = await Swal.fire({
        title: 'Ajouter une offre spéciale',
        html: `
            <input id="titre" class="swal2-input" placeholder="Titre">
            <input id="description" class="swal2-input" placeholder="Description">
            <div class="mb-3">
                <input id="prix" class="swal2-input" type="number" placeholder="Prix">
                <select id="devise" class="swal2-select">
                    <option value="XOF" selected>XOF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                </select>
            </div>
            <input type="file" id="image" class="swal2-file" accept="image/*">
        `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        confirmButtonText: 'Ajouter',
        preConfirm: () => {
            return {
                titre: document.getElementById('titre').value,
                description: document.getElementById('description').value,
                prix: document.getElementById('prix').value,
                devise: document.getElementById('devise').value,
                image: document.getElementById('image').files[0]
            }
        }
    });

    if (formValues) {
        const formData = new FormData();
        Object.keys(formValues).forEach(key => {
            if (formValues[key]) {
                formData.append(key, formValues[key]);
            }
        });

        try {
            const response = await fetch('/api/offres', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                Swal.fire('Succès!', 'Offre ajoutée avec succès', 'success');
                loadOffres();
            } else {
                Swal.fire('Erreur!', 'Erreur lors de l\'ajout de l\'offre', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            Swal.fire('Erreur!', 'Erreur lors de l\'ajout de l\'offre', 'error');
        }
    }
}

// Fonction pour supprimer une offre
async function deleteOffre(id) {
    if (await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Cette action est irréversible !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => result.isConfirmed)) {
        try {
            const response = await fetch(`/api/offres/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                Swal.fire('Supprimé!', 'L\'offre a été supprimée.', 'success');
                loadOffres();
            } else {
                Swal.fire('Erreur!', 'Erreur lors de la suppression de l\'offre', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            Swal.fire('Erreur!', 'Erreur lors de la suppression de l\'offre', 'error');
        }
    }
}

// Fonction pour modifier une offre
async function editOffre(id) {
    // D'abord, récupérer les données actuelles de l'offre
    const response = await fetch('/api/offres');
    const offres = await response.json();
    const offre = offres.find(o => o.id === id);
    
    if (!offre) {
        Swal.fire('Erreur!', 'Offre non trouvée', 'error');
        return;
    }
    
    const { value: formValues } = await Swal.fire({
        title: 'Modifier l\'offre',
        html: `
            <input id="titre" class="swal2-input" placeholder="Titre" value="${offre.titre}">
            <input id="description" class="swal2-input" placeholder="Description" value="${offre.description}">
            <div class="mb-3">
                <input id="prix" class="swal2-input" type="number" placeholder="Prix" value="${offre.prix}">
                <select id="devise" class="swal2-select">
                    <option value="XOF" ${offre.devise === 'XOF' ? 'selected' : ''}>XOF</option>
                    <option value="EUR" ${offre.devise === 'EUR' ? 'selected' : ''}>EUR</option>
                    <option value="USD" ${offre.devise === 'USD' ? 'selected' : ''}>USD</option>
                </select>
            </div>
            <input type="file" id="image" class="swal2-file" accept="image/*">
            <p class="mt-2"><small>Laissez le champ image vide pour garder l'image actuelle</small></p>
        `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        confirmButtonText: 'Modifier',
        preConfirm: () => {
            return {
                titre: document.getElementById('titre').value,
                description: document.getElementById('description').value,
                prix: document.getElementById('prix').value,
                devise: document.getElementById('devise').value,
                image: document.getElementById('image').files[0]
            }
        }
    });

    if (formValues) {
        const formData = new FormData();
        Object.keys(formValues).forEach(key => {
            if (formValues[key]) {
                formData.append(key, formValues[key]);
            }
        });

        try {
            const response = await fetch(`/api/offres/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                Swal.fire('Succès!', 'Offre modifiée avec succès', 'success');
                loadOffres();
            } else {
                Swal.fire('Erreur!', 'Erreur lors de la modification de l\'offre', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            Swal.fire('Erreur!', 'Erreur lors de la modification de l\'offre', 'error');
        }
    }
}

// Fonction pour charger les offres
async function loadOffres() {
    try {
        const response = await fetch('/api/offres');
        const offres = await response.json();
        
        const offresHTML = offres.map(offre => `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${offre.image}" class="card-img-top" alt="${offre.titre}">
                    <div class="card-body">
                        <h5 class="card-title">${offre.titre}</h5>
                        <p class="card-text">${offre.description}</p>
                        <p class="card-text">
                            <strong class="prix-original">${offre.prix.toLocaleString('fr-FR')} ${offre.devise}</strong>
                            <select class="form-select mt-2" onchange="convertirPrix(this, ${offre.prix}, '${offre.devise}')">
                                <option value="${offre.devise}" selected>${offre.devise}</option>
                                <option value="XOF" ${offre.devise === 'XOF' ? 'hidden' : ''}>XOF</option>
                                <option value="EUR" ${offre.devise === 'EUR' ? 'hidden' : ''}>EUR</option>
                                <option value="USD" ${offre.devise === 'USD' ? 'hidden' : ''}>USD</option>
                            </select>
                        </p>
                        <div class="btn-group w-100">
                            <button class="btn btn-warning" onclick="editOffre(${offre.id})">Modifier</button>
                            <button class="btn btn-danger" onclick="deleteOffre(${offre.id})">Supprimer</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('offres-container').innerHTML = offresHTML;
    } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        Swal.fire('Erreur!', 'Erreur lors du chargement des offres', 'error');
    }
}

// Fonction pour convertir les prix
async function convertirPrix(selectElement, montant, deviseOrigine) {
    const deviseDestination = selectElement.value;
    if (deviseOrigine === deviseDestination) return;

    try {
        const response = await fetch(`/api/convert-currency?amount=${montant}&from=${deviseOrigine}&to=${deviseDestination}`);
        const data = await response.json();
        
        const prixElement = selectElement.parentElement.querySelector('.prix-original');
        prixElement.textContent = `${data.amount.toLocaleString('fr-FR')} ${deviseDestination}`;
    } catch (error) {
        console.error('Erreur de conversion:', error);
        Swal.fire('Erreur!', 'Erreur lors de la conversion de la devise', 'error');
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
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${groupe.image}" class="card-img-top" alt="${groupe.titre}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${groupe.titre}</h5>
                            <button class="btn btn-danger btn-sm" onclick="deleteGroupe(${groupe.id})">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des voyages de groupe:', error);
    }
}

// Fonction pour supprimer un voyage de groupe
async function deleteGroupe(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce voyage de groupe ?')) {
        try {
            const response = await fetch(`/api/groupes/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadGroupes();
            } else {
                alert('Erreur lors de la suppression du voyage de groupe');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression du voyage de groupe');
        }
    }
}
