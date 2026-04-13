require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "ELEVATE API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
