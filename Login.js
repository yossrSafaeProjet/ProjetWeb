const express = require('express');
const passport = require('passport');
const SQLite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');

// Configurations Passport
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
        const db = new SQLite3.Database(dbPath);
        db.get('SELECT * FROM utilisateurs WHERE email = ?', [email], (err, row) => {
            if (err) {
                return done(err);
            }
            if (!row) {
                return done(null, false, { message: 'Utilisateur non trouvé.' });
            }

            bcrypt.compare(password, row.password, (bcryptErr, result) => {
                if (bcryptErr) {
                    return done(bcryptErr);
                }

                console.log('Résultat de la comparaison bcrypt:', result);
                if (!result) {
                    console.log('Mot de passe incorrect');
                    return done(null, false, { message: 'Mot de passe incorrect.' });
                }

                return done(null, row);
            });
        });
    }
));

passport.serializeUser((user, done) => {
    console.log(user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const db = new SQLite3.Database(dbPath);
    db.get('SELECT * FROM utilisateurs WHERE id = ?', [id], (err, row) => {
        done(err, row);
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', { message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            // Vérifier si l'utilisateur a déjà configuré l'authentification à deux facteurs
            if (user['fa2_secret']) {
                console.log('Redirection vers /verify-2fa');
                res.redirect('/espace');
                
            }
            else {
            res.redirect('/generate-2fa-secret');
            res.redirect('/enter-2fa-code');
            }
        });
    })(req, res, next);
});

router.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/espace');
        } else {
            res.redirect('/');
        }
    }
);

module.exports = router;
