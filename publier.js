const express = require('express');
const router = express.Router();
const SQLite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Utilisez sqlite3 pour gérer la base de données
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
const db = new SQLite3.Database(dbPath);

router.post('/publication', (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié et que req.user contient les informations nécessaires

    // Vérifiez si l'utilisateur est authentifié
    if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Insérez la publication dans la base de données avec le user_id associé à l'utilisateur authentifié
    db.run(`
        INSERT INTO publications (user_id, title, content)
        VALUES (?, ?, ?)
    `, [userId, title, content], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'insertion de la publication' });
        }

        // Récupérez toutes les publications de la base de données pour l'utilisateur spécifique
        db.all('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la récupération des publications' });
            }

            // Envoyez les publications au client
            console.log(publications);
            res.json({ publications });
        });
    });
});

router.get('/publications', (req, res) => {
    const userId = req.user.id; // Assurez-vous que l'utilisateur est authentifié et que req.user contient les informations nécessaires

    // Vérifiez si l'utilisateur est authentifié
    if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Récupérez toutes les publications de la base de données pour l'utilisateur spécifique
    db.all('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des publications existantes' });
        }

        // Envoyez les publications au client
        res.json({ publications });
    });
});
// Ajoutez cette nouvelle route pour la suppression
function getPublicationsForUser(userId, res) {
    // Récupérez toutes les publications de la base de données pour l'utilisateur spécifique
    db.all('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des publications' });
        }

        // Envoyez les publications au client
        res.json({ publications });
    });
}
router.delete('/publication/:id', (req, res) => {
    const { id } = req.params; 
        console.log(id);
    const userId = req.user.id;

    // Vérifiez si l'utilisateur est authentifié
    if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Supprimez la publication de la base de données
    db.run('DELETE FROM publications WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression de la publication' });
        }

        // Récupérez toutes les publications mises à jour de la base de données
        getPublicationsForUser(userId, res);
    });
});

module.exports = router;