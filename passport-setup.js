// passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '525322154016-dhanul58ij8po9quthleo1v2nhabf910.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback/'
}, (accessToken, refreshToken, profile, done) => {
    // Utilisez le profil de l'utilisateur pour l'authentification ou l'enregistrement dans votre base de données
    return done(null, profile);
}));


// Serialize/deserialize l'utilisateur dans la session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
