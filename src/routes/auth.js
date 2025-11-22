const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { jwtSecret } = require("../config");

const router = express.Router();

// 🔹 INSCRIPTION
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }


    // Par défaut, le rôle = "client"
    const user = await User.create({
      name,
      email,
      password: password,
      role: "client",
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || jwtSecret,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "✅ Utilisateur créé avec succès",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ Erreur inscription:", err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// 🔹 CONNEXION
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // 🔹 Inclure le rôle dans le token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      message: "✅ Connexion réussie",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ Erreur connexion:", err);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

module.exports = router;
