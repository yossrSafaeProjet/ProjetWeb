document.addEventListener('DOMContentLoaded', function () {
    const publishButton = document.getElementById('publishButton');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');

    publishButton.addEventListener('click', function () {
        // Désactive les boutons Modifier et Supprimer
        editButton.disabled = true;
        deleteButton.disabled = true;
    });
});