const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error("GET /products error:", error.message);
    // Treat any Prisma-related error or database issue as safe-fallback
    return res.json([]);
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("GET /products/:id error:", error.message);
    // Treat any Prisma-related error or database issue as safe-fallback
    return res.status(404).json({ message: "Product not found" });
  }
});

module.exports = router;
