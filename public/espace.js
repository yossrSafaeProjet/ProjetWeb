document.addEventListener('DOMContentLoaded', async() => {
    const publicationForm = document.getElementById('publicationForm');
    const publicationsList = document.getElementById('publicationsList');
    // Mettez à jour la liste des publications lors du chargement initial
    const existingPublications = await fetchExistingPublications();
    updatePublicationsList(existingPublications);
    publicationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

  
        // Envoyez une requête POST pour publier la nouvelle publication
        const response = await fetch('/publication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
            // Mettez à jour la liste des publications avec les nouvelles publications
            const responseData = await response.json();
            console.log(responseData.publications[0]);
            const publications = responseData.publications || []; // Check if publications exists
            updatePublicationsList(publications);
        } else {
            console.error('Erreur lors de la publication');
        }
    });

    async function fetchExistingPublications() {
        try {
            const response = await fetch('/publications'); // Ajoutez une nouvelle route GET pour récupérer les publications
            if (response.ok) {
                const responseData = await response.json();
                return responseData.publications || [];
            } else {
                console.error('Erreur lors de la récupération des publications existantes');
                return [];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des publications existantes :', error);
            return [];
        }
    }
    function updatePublicationsList(publications) {
        // Mettez à jour la liste des publications dans votre HTML
        publicationsList.innerHTML = '';
        console.log('Liste des publications reçues côté client :', publications);

        publications.forEach((publication) => {
            const publicationDiv = document.createElement('div');
            publicationDiv.classList.add('publication');
            publicationDiv.innerHTML = `
                <h3>${publication.title}</h3>
                <p>${publication.content}</p>
                <button class="delete-button" onclick="handleDeletePublication('${publication.id}')">Supprimer</button>
            `;
            publicationsList.appendChild(publicationDiv);
        });
    
    }

  
});
/* Delete publication */
async function handleDeletePublication(publicationId) {
    const confirmDelete = confirm('Voulez-vous vraiment supprimer cette publication ?');

    if (confirmDelete) {
        await deletePublication(publicationId);
    }
}

async function deletePublication(publicationId) {
    try {
        const response = await fetch(`/publication/${publicationId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // Mettez à jour la liste des publications après la suppression
            const responseData = await response.json();
            const publications = responseData.publications || [];
            updatePublicationsList(publications);
            location.reload();
        } else {
            console.error('Erreur lors de la suppression de la publication');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la publication :', error);
    }
}
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
          const response = await fetch('/logout', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
           },
            credentials: 'same-origin' 
          });

          alert(`Statut de la réponse : ${response.status}`);

          if (response.ok) {
            // Déconnexion réussie, faites quelque chose (par exemple, rediriger vers une page de connexion)
            window.location.href = '/login'; // Redirection vers la page de connexion après déconnexion
          } else {
            // Gérez les erreurs si la déconnexion échoue
            console.error('La déconnexion a échoué');
          }
        } catch (error) {
          console.error('Erreur lors de la déconnexion :', error);
        }
      });
    