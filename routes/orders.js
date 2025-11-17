const express = require("express");
const router = express.Router();
const models = require("../models");
const auth = require("../middleware/AuthMiddleware"); // doit définir req.user

const Order = models.Order || models.Orders;
const Menu = models.Menu || models.Menus;
const Restaurant = models.Restaurant || models.Restaurants;

// POST /api/orders  (protégé)
router.post("/", auth, async (req, res) => {
  console.log("[ORDERS] POST /api/orders - user:", req.user?.id, "body:", req.body);
  try {
    const { restaurantId, menuId, customerName, customerPhone, specialInstructions } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Utilisateur non authentifié" });
    if (!restaurantId || !menuId || !customerName || !customerPhone)
      return res.status(400).json({ message: "Champs requis manquants" });

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) return res.status(400).json({ message: "Restaurant introuvable" });

    const menu = await Menu.findByPk(menuId);
    if (!menu) return res.status(400).json({ message: "Menu introuvable" });

    if (menu.restaurantId && Number(menu.restaurantId) !== Number(restaurantId))
      return res.status(400).json({ message: "Le menu n'appartient pas à ce restaurant" });

    const created = await Order.create({
      userId,
      restaurantId,
      menuId,
      customerName,
      customerPhone,
      specialInstructions: specialInstructions || null,
      status: "pending",
    });

    console.log("[ORDERS] créé:", created.toJSON ? created.toJSON() : created);
    return res.status(201).json(created);
  } catch (err) {
    console.error("[ORDERS] erreur serveur:", err && err.stack ? err.stack : err);
    return res.status(500).json({ error: "Erreur serveur", detail: err?.message || String(err) });
  }
});

// GET /api/orders - commandes du user authentifié
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Utilisateur non authentifié" });

    const orders = await Order.findAll({
      where: { userId },
      include: [
        { model: Menu, attributes: ["id", "name"], required: false },
        { model: Restaurant, attributes: ["id", "name"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    const mapped = orders.map((o) => {
      const plain = o.toJSON ? o.toJSON() : o;
      return {
        id: plain.id,
        menuId: plain.menuId,
        menuName: plain.Menu?.name || plain.menuName || null,
        restaurantId: plain.restaurantId,
        restaurantName: plain.Restaurant?.name || plain.restaurantName || null,
        customerName: plain.customerName,
        customerPhone: plain.customerPhone,
        specialInstructions: plain.specialInstructions,
        status: plain.status,
        reservationTime: plain.orderTime || plain.reservationTime || plain.createdAt,
        createdAt: plain.createdAt,
      };
    });

    return res.json(mapped);
  } catch (err) {
    console.error("[ORDERS] GET erreur:", err);
    return res.status(500).json({ error: "Erreur serveur", detail: err?.message || String(err) });
  }
});

// GET /api/orders/client/:id - (accessible aux admin/owner ou pour debug) commandes d'un client
router.get("/client/:id", auth, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ message: "ID invalide" });

    // autorisation simple : user lui-même ou admin/owner
    const me = req.user;
    if (me.id !== targetId && me.role !== "admin" && me.role !== "owner") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const orders = await Order.findAll({
      where: { userId: targetId },
      include: [
        { model: Menu, attributes: ["id", "name"], required: false },
        { model: Restaurant, attributes: ["id", "name"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    const mapped = orders.map((o) => {
      const plain = o.toJSON ? o.toJSON() : o;
      return {
        id: plain.id,
        menuId: plain.menuId,
        menuName: plain.Menu?.name || plain.menuName || null,
        restaurantId: plain.restaurantId,
        restaurantName: plain.Restaurant?.name || plain.restaurantName || null,
        customerName: plain.customerName,
        customerPhone: plain.customerPhone,
        specialInstructions: plain.specialInstructions,
        status: plain.status,
        reservationTime: plain.orderTime || plain.reservationTime || plain.createdAt,
        createdAt: plain.createdAt,
      };
    });

    return res.json(mapped);
  } catch (err) {
    console.error("[ORDERS] GET /client/:id erreur:", err);
    return res.status(500).json({ error: "Erreur serveur", detail: err?.message || String(err) });
  }
});

module.exports = router;