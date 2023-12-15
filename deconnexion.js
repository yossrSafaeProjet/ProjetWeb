
const express = require('express');
const router = express.Router();
const path = require('path');
const SQLite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
const db = new SQLite3.Database(dbPath);

router.post('/logout', (req, res) => {
    const userId = req.user.id; // Obtenez l'ID de l'utilisateur connecté (utilisant Passport.js)
  
    // Fonction pour révoquer tous les autres JWT associés à cet utilisateur dans la base de données
    function revokeOtherUserTokens(userId) {
      db.run('UPDATE jwt_tokens SET is_revoked = true WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('Erreur lors de la révocation des autres JWT :', err);
          res.status(500).send('Erreur lors de la déconnexion des autres équipements.');
        } else {
  
          // Déconnexion des autres équipements effectuée avec succès
          console.log('Déconnexion des autres équipements effectuée avec succès.');
          db.all('SELECT * FROM jwt_tokens', (err, rows) => {
            if (err) {
              console.error('Erreur lors de la récupération des données de la table jwt_tokens :', err);
            } else {
              console.table(rows); // Affichage sous forme de tableau
            }
          });
          // Redirection vers la page de connexion après la déconnexion des autres sessions
          res.redirect('/login');
        }
      });
    }
    revokeOtherUserTokens(userId);
  });

  router.get('/espace', (req, res) => {
    const userId = req.user.id; // Supposons que vous avez un utilisateur authentifié
  
    // Récupérez les publications de l'utilisateur depuis la base de données
    db.get('SELECT * FROM jwt_tokens WHERE user_id = ? AND is_revoked = true', [userId], (err, tokenInfo) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erreur lors de la vérification du token.');
      } else {
        if (!tokenInfo) {
          // Si le token est révoqué, redirigez l'utilisateur vers la page de connexion
          res.redirect('/login');
        } else {
          // Le token n'est pas révoqué, continuez à récupérer les publications
          db.all('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
            if (err) {
              console.error(err.message);
              res.status(500).send('Erreur lors de la récupération des publications.');
            } else {
              // Rendez la page avec les données des publications
              res.render('espace', { publications });
            }
          });
        }
      }
    });
  });
  module.exports = router;