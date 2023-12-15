const SQLite3 = require('sqlite3').verbose();

// Création de la base de données
const db = new SQLite3.Database(__dirname + '/ma_base_de_donnees.db');

const bcrypt = require('bcrypt');
// Création de la table "utilisateurs"
db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY,
    nom TEXT,
    prenom TEXT,
    email TEXT,
    password TEXT,
    fa2_secret TEXT,
    google_id Integer
)`);
db.run(`
CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
)
`);
db.run(`CREATE TABLE IF NOT EXISTS jwt_tokens (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    token TEXT,
    expires_at DATETIME,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
  )`);
db.close();