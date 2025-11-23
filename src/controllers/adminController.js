const sequelize = require('../db');
const bcrypt = require('bcrypt');

async function listUsers(req, res) {
  try {
    const [rows] = await sequelize.query(
      'SELECT id, name, email, role, createdAt FROM users ORDER BY id DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin.listUsers]', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const authorizedRoles = ["client", "proprietaire", "admin"];

    if (!authorizedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    await sequelize.query(
      'UPDATE users SET role = ? WHERE id = ?',
      { replacements: [role, id] }
    );

    return res.json({ message: 'Rôle mis à jour' });
  } catch (err) {
    console.error('[admin.updateRole]', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role = 'client' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const [exists] = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (exists.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      'INSERT INTO users (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      {
        replacements: [name, email, hashedPassword, role]
      }
    );

    return res.json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    console.error("[admin.createUser]", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { listUsers, updateRole, createUser };
