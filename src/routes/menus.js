// backend/src/routes/menus.js
const express = require("express");
// Importer depuis l'index des modèles (CommonJS)
const { Menu } = require("../models");

const router = express.Router();

// GET /api/menus
// - si ?restaurantId=XX fourni => retourne les menus de ce restaurant
// - sinon retourne tous les menus
router.get("/", async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!Menu) {
      console.error("Modèle Menu non trouvé dans les modèles importés");
      return res.status(500).json({ message: "Erreur interne: modèle Menu manquant" });
    }

    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;

    const menus = await Menu.findAll({ where });
    res.json(menus);
  } catch (error) {
    console.error("Erreur get menus :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/menus/:id => détail d'un menu
router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu non trouvé" });
    res.json(menu);
  } catch (error) {
    console.error("Erreur get menu by id:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Compatibilité : garder /api/menus/restaurants/:restaurantId/menus
router.get("/restaurants/:restaurantId/menus", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!Menu) {
      console.error("Modèle Menu non trouvé dans les modèles importés");
      return res.status(500).json({ message: "Erreur interne: modèle Menu manquant" });
    }
    const menus = await Menu.findAll({ where: { restaurantId } });
    res.json(menus);
  } catch (error) {
    console.error("Erreur menus compatibility :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
