const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data safely to avoid foreign key constraint errors
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();

  // Categories
  const categories = [
    { name: "Suits & Tuxedos", slug: "suits-tuxedos" },
    { name: "Shirts & Tops", slug: "shirts-tops" },
    { name: "Trousers & Shorts", slug: "trousers-shorts" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
  ];

  console.log("Upserting categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const suitsCat = await prisma.category.findUnique({
    where: { slug: "suits-tuxedos" },
  });
  const shirtsCat = await prisma.category.findUnique({
    where: { slug: "shirts-tops" },
  });
  const pantsCat = await prisma.category.findUnique({
    where: { slug: "trousers-shorts" },
  });
  const outCat = await prisma.category.findUnique({
    where: { slug: "outerwear" },
  });
  const accCat = await prisma.category.findUnique({
    where: { slug: "accessories" },
  });

  const rawProducts = [
    { name: "Midnight Blue Wool Suit", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7" },
    { name: "Charcoal Grey Tuxedo", image: "https://images.unsplash.com/photo-1520975922203-bf6e8f1b1f6b" },
    { name: "Ivory Linen Suit", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070" },
    { name: "Velvet Dinner Jacket", image: "https://images.unsplash.com/photo-1542060748-10c28b62716a" },
    { name: "Classic Black Suit", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c" },
    { name: "Navy Slim Fit Suit", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab" },
    { name: "Double Breasted Suit", image: "https://images.unsplash.com/photo-1520974735194-1c0bba3c1b7b" },
    { name: "Wedding White Tuxedo", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543" },
    { name: "Casual Blazer", image: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7" },
    { name: "Formal Coat", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070" },
    { name: "Luxury Overcoat", image: "https://images.unsplash.com/photo-1542060748-10c28b62716a" },
    { name: "Winter Trench Coat", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f" },
    { name: "Business Suit Set", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c" },
    { name: "Premium Wool Coat", image: "https://images.unsplash.com/photo-1520975922203-bf6e8f1b1f6b" },
    { name: "Modern Grey Suit", image: "https://images.unsplash.com/photo-1520974735194-1c0bba3c1b7b" },
    { name: "Designer Blazer", image: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7" },
    { name: "Elegant Evening Suit", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543" },
    { name: "Luxury Cashmere Coat", image: "https://images.unsplash.com/photo-1542060748-10c28b62716a" },
    { name: "Office Formal Suit", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c" },
    { name: "Classic Brown Blazer", image: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7" },
    { name: "Premium Black Overcoat", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f" }
  ];

  function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  function getCategoryForName(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("coat") || lowerName.includes("overcoat")) return outCat.id;
    if (lowerName.includes("blazer")) return suitsCat.id;
    return suitsCat.id; // Defaulting to suits as most of them are suits/tuxedos
  }

  const processedProducts = rawProducts.map((p) => {
    // Generate a price between $200 and $900
    const randomPrice = Math.floor(Math.random() * (900 - 200 + 1) + 200);

    return {
      name: p.name,
      slug: generateSlug(p.name),
      description: "A premium luxury piece crafted with the finest materials for a sophisticated look.",
      price: randomPrice,
      image: p.image,
      categoryId: getCategoryForName(p.name)
    };
  });

  console.log(`Seeding ${processedProducts.length} premium products...`);
  await prisma.product.createMany({
    data: processedProducts,

  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
