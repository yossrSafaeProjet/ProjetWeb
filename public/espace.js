document.addEventListener('DOMContentLoaded', () => {
    const publicationForm = document.getElementById('publicationForm');
    const publicationsList = document.getElementById('publicationsList');
    // Mettez à jour la liste des publications lors du chargement initial

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

            `;
            publicationsList.appendChild(publicationDiv);
        });
    }

  
});

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
    
