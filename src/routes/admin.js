const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/AuthMiddleware");
const { Users } = require("../models"); // Assure-toi que le modèle Users est bien exporté

// 🔹 Middleware : accessible uniquement aux admins
router.use(authenticateToken, authorizeRoles("admin"));

// 🔹 GET /api/admin/users → lister tous les utilisateurs
router.get("/users", async (req, res) => {
try {
const users = await Users.findAll({ attributes: ["id", "name", "email", "role", "createdAt"] });
res.json(users);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Erreur serveur" });
}
});

// 🔹 PATCH /api/admin/users/:id/role → changer le rôle d'un utilisateur
router.patch("/users/:id/role", async (req, res) => {
const userId = req.params.id;
const { role } = req.body;

if (!["admin", "proprietaire", "client"].includes(role)) {
return res.status(400).json({ error: "Rôle invalide" });
}

try {
const user = await Users.findByPk(userId);
if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

```
user.role = role;
await user.save();

res.json({ message: "Rôle mis à jour", user });
```

} catch (err) {
console.error(err);
res.status(500).json({ error: "Erreur serveur" });
}
});

// 🔹 POST /api/admin/users → ajouter un nouvel utilisateur (optionnel)
router.post("/users", async (req, res) => {
const { name, email, password, role } = req.body;

if (!name || !email || !password || !["admin", "proprietaire", "client"].includes(role)) {
return res.status(400).json({ error: "Données invalides" });
}

try {
const newUser = await Users.create({ name, email, password, role });
res.status(201).json({ message: "Utilisateur créé", user: newUser });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Erreur serveur" });
}
});

// 🔹 DELETE /api/admin/users/:id → supprimer un utilisateur (optionnel)
router.delete("/users/:id", async (req, res) => {
const userId = req.params.id;
try {
const deleted = await Users.destroy({ where: { id: userId } });
if (!deleted) return res.status(404).json({ error: "Utilisateur non trouvé" });
res.json({ message: "Utilisateur supprimé" });
} catch (err) {
console.error(err);
res.status(500).json({ error: "Erreur serveur" });
}
});

module.exports = router;
