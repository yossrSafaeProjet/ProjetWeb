document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêcher le rechargement de la page après la soumission du formulaire
    var nom = document.getElementById('nom').value;
    var prenom = document.getElementById('prenom').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmationMotDePasse = document.getElementById('confirmationMotDePasse').value;

    var message = document.getElementById('message');

    // Vérifier si les mots de passe correspondent
    if (password !== confirmationMotDePasse) {
        message.textContent = "Les mots de passe ne correspondent pas. Veuillez réessayer.";
        return;
    } else {
        message.textContent = "";
    }

    // Envoyer les données au serveur
    fetch('http://localhost:3000/enregistrerUtilisateur', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom: nom,
            prenom: prenom,
            email: email,
            password: password,
            confirmationMotDePasse: confirmationMotDePasse
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l\'enregistrement de l\'utilisateur.');
        }
        alert('Utilisateur enregistré avec succès !');
    })
    .catch(error => {
        console.error(error);
        alert('Une erreur est survenue lors de l\'enregistrement de l\'utilisateur.');
    });
});