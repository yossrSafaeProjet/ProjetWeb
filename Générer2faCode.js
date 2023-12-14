const express = require('express');
const SQLite3 = require('sqlite3').verbose();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const path = require('path')

const router = express.Router();
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');

router.get('/generate-2fa-secret', (req, res) => {
  // Votre logique d'itinéraire ici
  const userId = req.user.id; // Supposons que vous avez authentifié l'utilisateur
  const secret = speakeasy.generateSecret();
  
  const otpAuthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: 'projetWeb',
    issuer: 'projetWeb',
    encoding: 'base32'
  });

  // Utilisez qrcode pour générer le code QR
  QRCode.toDataURL(otpAuthUrl, (err, imageUrl) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la génération du code QR.');
    } else {
      // Mettez à jour la base de données avec la clé secrète
      const db = new SQLite3.Database(dbPath);
      db.run('UPDATE utilisateurs SET "fa2_secret" = ? WHERE id = ?', [secret.base32, userId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr.message);
          res.status(500).send('Erreur lors de l\'enregistrement de la clé 2FA.');
        } else {
          req.session.secret = secret.base32; // Stockez la clé secrète en session
          // Renvoyez le code QR et d'autres informations à la vue
          res.render('generate-2fa-secret', { imageUrl, secret });
        }
      });
    }
  });
});

module.exports = router;
