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
    // Return empty array if no products found, ensuring frontend doesn't crash
    res.json(products || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    // If DB is not yet initialized or errors out, gracefully return an empty array or proper error
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
       // Table does not exist yet
       return res.json([]);
    }
    res.status(500).json({ message: "Server Error" });
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
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
