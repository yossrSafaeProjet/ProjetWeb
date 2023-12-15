const express = require('express');
const SQLite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router(); // Utilisez express.Router() pour créer un routeur
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');

router.post('/', (req, res) => {
  const utilisateur = req.body;
  const db = new SQLite3.Database(dbPath);
  // Vérifiez si les mots de passe correspondent
  if (utilisateur.password !== utilisateur.confirmationMotDePasse) {
    res.status(400).send('Les mots de passe ne correspondent pas. Veuillez réessayer.');
    return;
  }

  // Hasher le mot de passe
  bcrypt.hash(utilisateur.password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors du hashage du mot de passe.');
      return;
    }

    // Insérez l'utilisateur dans la base de données avec le mot de passe hashé
    db.run(`
      INSERT INTO utilisateurs (nom, prenom, email, password, fa2_secret, google_id) VALUES (?, ?, ?, ?, ?, ?)
    `, [utilisateur.nom, utilisateur.prenom, utilisateur.email, hashedPassword, utilisateur.fa2_secret, utilisateur.google_id], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
      } else {
        res.redirect('/login');
      }
    });
  });
});

module.exports = router;
