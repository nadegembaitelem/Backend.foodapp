const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API FoodApp en ligne 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);

module.exports = app;
