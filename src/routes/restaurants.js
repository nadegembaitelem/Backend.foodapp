const express = require("express");
const router = express.Router();
const models = require("../models");
const Restaurant = models.Restaurant || models.restaurants || models.Restaurants;
const Menu = models.Menu || models.menus || models.Menus;

// GET /restaurants - liste tous les restaurants
router.get("/", async (req, res) => {
  try {
    console.log("[ROUTES] GET /restaurants");
    if (!Restaurant) return res.status(500).json({ message: "Model Restaurant introuvable" });
    const restaurants = await Restaurant.findAll({ order: [["id", "ASC"]] });
    return res.json(Array.isArray(restaurants) ? restaurants : []);
  } catch (err) {
    console.error("Erreur GET /restaurants:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /restaurants/:id/menus - menus d'un restaurant (200 + [] si aucun)
router.get("/:id/menus", async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    if (Number.isNaN(restaurantId)) {
      return res.status(400).json({ message: "ID de restaurant invalide" });
    }
    console.log(`[ROUTES] GET /restaurants/${restaurantId}/menus`);
    if (!Menu) return res.status(500).json({ message: "Model Menu introuvable" });
    const menus = await Menu.findAll({ where: { restaurantId } });
    return res.json(Array.isArray(menus) ? menus : []);
  } catch (err) {
    console.error("Erreur GET /restaurants/:id/menus:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;