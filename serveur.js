// server.js
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path')
const morgan = require('morgan');
const loginRouter = require('./Login');
const twoFactorAuthRouter = require('./Générer2faCode');
const authRoutes = require('./verify')
const publierRoutes = require('./publier')
const deconnexionRoutes = require('./deconnexion')
const espacPublicRoutes = require('./espacepublic')
const app = express();
app.set('view engine', 'ejs');
require('./passport-setup');

/* require('./Bdd'); */

app.use(express.static('Login'));
app.use(express.static('public'));
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
  const actionsDisabled = req.query.actionsDisabled === 'true';
  res.render('espace',{ actionsDisabled });
});
app.use('',espacPublicRoutes);
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
app.use('', authRoutes);

app.use('', publierRoutes);
app.use('', deconnexionRoutes);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
