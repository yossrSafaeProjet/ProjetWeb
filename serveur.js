// server.js
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const SQLite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path')
const morgan = require('morgan');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const loginRouter = require('./Login');
const twoFactorAuthRouter = require('./Générer2faCode');
const app = express();
app.set('view engine', 'ejs');
require('./passport-setup');

/* require('./Bdd'); */

app.use(express.static('Login'));
app.use(session({ secret: 'votre-secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
const bodyParser = require('body-parser');
const { verify } = require('crypto');
app.use(bodyParser.urlencoded({ extended: true }));
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
app.use(express.static('css'));

// Routes
app.get('/', (req, res) => res.redirect('/Acceuil'));

app.get('/Acceuil', (req, res) => {
  res.render('Acceuil', { message: '' });
});

app.get('/login', (req, res) => {
  res.render('login', { message: '' });
});
app.use('/', loginRouter); 
app.get('/espace', (req, res) => {
  const fromHomePage = req.query.fromHomePage === 'false';
  if (req.isAuthenticated()) {
    res.render('espace',{fromHomePage});
  } else {
    res.redirect('/');
  }
});
app.get('/espacePublic', (req, res) => {
  
  res.render('espace', { fromHomePage });
});
app.get('/inscription', (req, res) => {
    res.render('inscription');
  });
  const registrationRouter = require('./Innscription');
  app.use('/enregistrerUtilisateur', registrationRouter); 

app.use('', twoFactorAuthRouter);
// ... (Other routes)
app.get('/enter-2fa-code', (req, res) => {
  res.render('enter-2fa-code');
});
// Vérifier le code 2FA
app.post('/verify-2fa-code', (req, res) => {

  const userToken = req.body['2fa'];
  console.log(userToken);
  const userId = req.user.id;
  
  const db = new SQLite3.Database(dbPath);
  db.get('SELECT fa2_secret FROM utilisateurs WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erreur lors de la récupération de la clé 2FA.');
    } else {
      console.log(row['fa2_secret'])
      const secret = row['fa2_secret'];
      
      const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token: userToken, window: 1 });

      if (verified) {
        // Authentification réussie, redirigez ou effectuez d'autres actions
        res.send('Authentification réussie');
        res.redirect('/espace')
      } else {
        
        res.send('Code incorrect, veuillez réessayer');
      }
    }
  });
});
// server.js
// ...
/* function verifyTwoFactorCode(userId, userToken, callback) {
  const db = new SQLite3.Database(dbPath);
  db.get('SELECT fa2_secret FROM utilisateurs WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error(err.message);
      return callback('Erreur lors de la récupération de la clé 2FA.');
    } else {
      const secret = row['fa2_secret'];
      const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token: userToken, window: 1 });

      if (verified) {
        // Authentification réussie
        return callback(null, 'Authentification réussie');
      } else {
        return callback('Code incorrect, veuillez réessayer');
      }
    }
  });
} */
// Route pour gérer la publication


// ... (Other configurations and server start)

app.get('/espace', (req, res) => {
 /*  const fromHomePage = req.query.fromHomePage === 'false'; */
  const userId = req.user.id; // Supposons que vous avez un utilisateur authentifié

  // Récupérez les publications de l'utilisateur depuis la base de données
  const db = new SQLite3.Database(dbPath);
  db.all('SELECT * FROM publications WHERE user_id = ?', [userId], (err, publications) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erreur lors de la récupération des publications.');
    } else {
      // Rendez la page avec les données des publications
      res.render('espace', { publications });
    }
  });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
