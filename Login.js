const express = require('express');
const passport = require('passport');
const SQLite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');

const secretKey = 'aqzsedrftg';
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');

const db = new SQLite3.Database(dbPath);
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
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const db = new SQLite3.Database(dbPath);
    db.get('SELECT * FROM utilisateurs WHERE id = ?', [id], (err, row) => {
        done(err, row);
    });
});

/* router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        const db = new SQLite3.Database(dbPath);

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
            if (user['fa2_secret']) {
                const token = jwt.sign({
                    userId: user.id,
                    twoFactorEnabled: user.fa2_secret !== null // Vérifiez si l'utilisateur a activé le 2FA
                  }, secretKey);
                  //res.json({ token });
                  jwt.verify(token,secretKey , (err, decoded) => {
                    if (err) {
                      // Gérez l'erreur si le token est invalide ou a expiré
                      console.error('Erreur de vérification du token :', err);
                    } else {
                      // decoded contient les informations décryptées du token JWT
                      console.log('Informations décryptées du token :', decoded);
                      // Accédez aux propriétés spécifiques du token
                      console.log('ID utilisateur :', decoded.userId);
                      console.log('2FA activé :', decoded.twoFactorEnabled);
                    }
                  });
                  // Enregistrez le JWT valide dans la base de données
                  const expirationTime = new Date(Date.now() + 3600000); // Exemple : expiration dans 1 heure
                  db.run('INSERT INTO jwt_tokens (user_id, token, expires_at,is_revoked) VALUES (?, ?, ?,false)', [user.id, token, expirationTime], (insertErr) => {
                      if (insertErr) {
                          console.error('Erreur lors de l\'enregistrement du JWT :', insertErr);
                          // Gérer l'erreur d'enregistrement du JWT dans la base de données
                      } else {
                          // Redirigez l'utilisateur vers la vérification 2FA ou l'action appropriée
                          console.log('Redirection vers /verify-2fa');
                          res.set('Authorization',`Bearer ${token}`);
                          res.redirect('/espace');
                      }
                  });
                  // db insert 
                  db.all('SELECT * FROM jwt_tokens', (err, rows) => {
                      if (err) {
                        console.error('Erreur lors de la récupération des données de la table jwt_tokens :', err);
                      } else {
                        console.table(rows); // Affichage sous forme de tableau
                      }
                    });
          }
            else {
            res.redirect('/generate-2fa-secret');
            }
        });
    })(req, res, next);
}); */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('login', { message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
      }
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }

        if (user['fa2_secret']) {
          try {
            const token = jwt.sign({
              userId: user.id,
              twoFactorEnabled: user.fa2_secret !== null
            }, secretKey);

            const expirationTime = new Date(Date.now() + 3600000);

            await new Promise((resolve, reject) => {
              db.run('INSERT INTO jwt_tokens (user_id, token, expires_at, is_revoked) VALUES (?, ?, ?, 0)', [user.id, token, expirationTime], (insertErr) => {
                if (insertErr) {
                  console.error('Erreur lors de l\'enregistrement du JWT :', insertErr);
                  reject(insertErr);
                } else {
                  console.log('JWT enregistré avec succès');
                  resolve();
                }
              });
            });

            res.set('Authorization', `Bearer ${token}`);
            return res.redirect('/espace');
          } catch (error) {
            console.error('Erreur lors de la génération et de l\'enregistrement du JWT :', error);
            return res.status(500).send('Erreur lors de la connexion');
          }
        } else {
          return res.redirect('/generate-2fa-secret');
        }
      });
    })(req, res, next);
  });

router.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
        if (req.isAuthenticated()) {
            const googleId = req.user.id; // Ensure this is the correct property
            const db = new SQLite3.Database(dbPath);

            try {
                // Check if the user already exists in the database
                const row = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM utilisateurs WHERE google_id = ?', [googleId], (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });

                if (!row) {
                    // User doesn't exist, insert into the database
                    const insertQuery = 'INSERT INTO utilisateurs (google_id, nom, prenom, email) VALUES (?, ?, ?, ?)';
                    const values = [googleId, req.user.familyName, req.user.name?.givenName, req.user.emails[0].value];

                    await new Promise((resolve, reject) => {
                        db.run(insertQuery, values, (insertErr) => {
                            if (insertErr) {
                                reject(insertErr);
                            } else {
                                resolve();
                            }
                        });
                    });

                    // Fetch the newly inserted user
                    const newUser = await new Promise((resolve, reject) => {
                        db.get('SELECT * FROM utilisateurs WHERE google_id = ?', [googleId], (err, user) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(user);
                            }
                        });
                    });

                    // Set req.user to the newly created user
                    req.login(newUser, (loginErr) => {
                        if (loginErr) {
                            console.error('Error during login:', loginErr);
                            res.redirect('/');
                        } else {
                            res.redirect('/generate-2fa-secret');
                        }
                    });

                } else {
                    // User already exists, set req.user
                    req.login(row, (loginErr) => {
                        if (loginErr) {
                            console.error('Error during login:', loginErr);
                            res.redirect('/');
                        } 
                        else {
                            res.redirect('/generate-2fa-secret');
                        }
                    });
                }
            } catch (error) {
                // Handle errors
                console.error('Error:', error);
                res.redirect('/');
            } finally {
                // Close the database connection
                db.close();
            }
        } else {
            res.redirect('/');
        }
    }
);

// Configuration du JWT
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey,
    expiresIn: '1h' // Durée de validité du jeton (par exemple, 1 heure)
};
passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    // Récupération de l'ID de l'utilisateur à partir du JWT
    const userId = jwtPayload.userId;

    // Requête à la base de données pour charger les informations de l'utilisateur
    // Utilisez l'ID récupéré pour obtenir les détails de l'utilisateur depuis la base de données
    db.get('SELECT * FROM utilisateurs WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));

module.exports = router;
