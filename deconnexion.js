
const express = require('express');
const router = express.Router();
const path = require('path');
const SQLite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
const db = new SQLite3.Database(dbPath);

/* router.post('/logout', (req, res) => {
    const userId = req.user.id;
  
    function revokeOtherUserTokens(userId) {
      db.run('UPDATE jwt_tokens SET is_revoked = 1 WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('Erreur lors de la révocation des autres JWT :', err);
          res.status(500).send('Erreur lors de la déconnexion des autres équipements.');
        } else {
          res.clearCookie('session-cookie');
          console.log('Déconnexion des autres équipements effectuée avec succès.');
          res.redirect('/login');
        }
      });
    }
  
    revokeOtherUserTokens(userId);
  });
 */
  /* router.get('/espace', (req, res) => {
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
  }); */
  router.get('/espace', (req, res) => {
    if (req.isAuthenticated()) {
      const userId = req.user.id;
      db.get('SELECT * FROM jwt_tokens WHERE user_id = ?', [userId], (err, tokenInfo) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Erreur lors de la vérification du token.');
        }
        if (!tokenInfo) {
          return res.redirect('/login');
        } else {
          return res.render('espace');
        }
      });
    } else {
      res.redirect('/');
    }
  });
  /* router.post('/logout', (req, res) => {
    const userId = req.user.id;
  
    function revokeOtherUserTokens(userId) {
      db.run('UPDATE jwt_tokens SET is_revoked = 1 WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('Erreur lors de la révocation des autres JWT :', err);
          res.status(500).send('Erreur lors de la déconnexion des autres équipements.');
        } else {
          res.clearCookie('session-cookie');
          console.log('Déconnexion des autres équipements effectuée avec succès.');
          res.redirect('/login');
        }
      });
    }
  
    revokeOtherUserTokens(userId);
  }); */
  router.post('/logout', (req, res) => {
    const userId = req.user.id;
    console.log(userId);
  
    function revokeOtherUserTokens(userId) {
      db.run('UPDATE jwt_tokens SET is_revoked = 1 WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('Erreur lors de la révocation des autres JWT :', err);
          res.status(500).send('Erreur lors de la déconnexion des autres équipements.');
        } else {
          res.clearCookie('session-cookie');
          console.log('Déconnexion des autres équipements effectuée avec succès.');
          res.redirect('/login');
        }
      });
    }
  
    revokeOtherUserTokens(userId);
  });
  module.exports = router;  