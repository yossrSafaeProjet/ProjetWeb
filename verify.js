const express = require('express');
const router = express.Router();
const SQLite3 = require('sqlite3');
const speakeasy = require('speakeasy');
const path = require('path');
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/'); // Redirect to the login page or handle unauthorized access
};
router.post('/enable-2fa', (req, res) => {
    const userChoice = req.body.choice;
  
    if (userChoice === 'yes') {
        // Redirect to the page where the user enters the 2FA code
        res.redirect('/enter-2fa-code');
    } else if(userChoice === 'no') {
        // Handle the case where the user chose not to enable 2FA
        // You might want to redirect or render a different page
        actionsDisabled =true;
        res.redirect(`/espace?actionsDisabled=${actionsDisabled}`);        
    }
  });
  
  // Vérifier le code 2FA
  router.post('/verify-2fa-code',ensureAuthenticated, (req, res) => {
  
    const userToken = req.body['2fa'];
    const userId = req.user.id;
    const db = new SQLite3.Database(dbPath);
    
    db.get('SELECT fa2_secret FROM utilisateurs WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erreur lors de la récupération de la clé 2FA.');
      } else {
        
        const secret = row['fa2_secret'];
        
        const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token: userToken, window: 1 });
  
        if (verified) {
          // Authentification réussie, redirigez ou effectuez d'autres actions
  /*         res.send('Authentification réussie');
  
   */        
  res.redirect('/espace');

        } else {
          
          res.send('Code incorrect, veuillez réessayer');
        }
      }
    });
  });
  module.exports = router;