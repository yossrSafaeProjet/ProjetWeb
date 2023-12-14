const express = require('express');
const SQLite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router(); // Use express.Router() to create a router

router.use(express.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');

router.post('/', (req, res) => {
  const utilisateur = req.body;
  const db = new SQLite3.Database(dbPath);
  // Vérifier si les mots de passe correspondent
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

    // Insérer l'utilisateur dans la base de données avec le mot de passe hashé
    db.run(`
      INSERT INTO utilisateurs (nom, prenom, email, password) VALUES (?, ?, ?, ?)
    `, [utilisateur.nom, utilisateur.prenom, utilisateur.email, hashedPassword], (err) => {
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
