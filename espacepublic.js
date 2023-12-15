const express = require('express');
const router = express.Router();
const SQLite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const dbPath = path.join(__dirname, 'ma_base_de_donnees.db');
const db = new SQLite3.Database(dbPath);
router.get('/espacePublic', (req, res) => {
    // Récupération des publications depuis la base de données (supposons que vous utilisez SQLite)
    db.all('SELECT * FROM publications', (err, publications) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erreur lors de la récupération des publications depuis la base de données.');
      } else {
        // Rendre la vue EJS avec les données récupérées
        
        res.render('espacePublic', { publications });
      }
    });
  });
  module.exports=router;