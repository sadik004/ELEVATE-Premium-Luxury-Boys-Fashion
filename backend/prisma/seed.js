const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { name: "Suits & Tuxedos", slug: "suits-tuxedos" },
    { name: "Shirts & Tops", slug: "shirts-tops" },
    { name: "Trousers & Shorts", slug: "trousers-shorts" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
  ];

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

  const products = [
    // Suits
    {
      name: "Midnight Blue Wool Suit",
      description: "Classic fit, 100% fine wool.",
      price: 450.0,
      image: "/images/suit-blue.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Charcoal Grey Tuxedo",
      description: "Elegant evening wear.",
      price: 550.0,
      image: "/images/tux-grey.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Ivory Linen Suit",
      description: "Perfect for summer events.",
      price: 380.0,
      image: "/images/suit-ivory.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Velvet Dinner Jacket",
      description: "Plush velvet jacket with satin lapels.",
      price: 400.0,
      image: "/images/jacket-velvet.jpg",
      categoryId: suitsCat.id,
    },
    // Shirts
    {
      name: "Crisp White Poplin Shirt",
      description: "Essential formal shirt.",
      price: 120.0,
      image: "/images/shirt-white.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Light Blue Oxford",
      description: "Versatile button-down.",
      price: 110.0,
      image: "/images/shirt-blue.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Silk Blend Dress Shirt",
      description: "Luxurious feel and subtle sheen.",
      price: 180.0,
      image: "/images/shirt-silk.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Pinstripe Formal Shirt",
      description: "Classic business styling adapted for boys.",
      price: 130.0,
      image: "/images/shirt-stripe.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Black Cotton T-Shirt",
      description: "Premium casual staple.",
      price: 60.0,
      image: "/images/tshirt-black.jpg",
      categoryId: shirtsCat.id,
    },
    // Trousers
    {
      name: "Tailored Wool Trousers",
      description: "Pleated wool blend trousers.",
      price: 150.0,
      image: "/images/pants-wool.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Cotton Chinos",
      description: "Smart casual essential.",
      price: 95.0,
      image: "/images/pants-chinos.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Linen Shorts",
      description: "Breathable summer wear.",
      price: 80.0,
      image: "/images/shorts-linen.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Formal Tuxedo Pants",
      description: "Matching trousers with satin stripe.",
      price: 180.0,
      image: "/images/pants-tux.jpg",
      categoryId: pantsCat.id,
    },
    // Outerwear
    {
      name: "Cashmere Blend Overcoat",
      description: "Winter luxury.",
      price: 650.0,
      image: "/images/coat-cashmere.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Trench Coat",
      description: "Classic water-resistant design.",
      price: 320.0,
      image: "/images/coat-trench.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Leather Biker Jacket",
      description: "Edgy yet refined.",
      price: 480.0,
      image: "/images/jacket-leather.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Quilted Vest",
      description: "Layering piece for transitional weather.",
      price: 210.0,
      image: "/images/vest-quilted.jpg",
      categoryId: outCat.id,
    },
    // Accessories
    {
      name: "Silk Bow Tie",
      description: "Pre-tied black silk.",
      price: 45.0,
      image: "/images/tie-bow.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Leather Belt",
      description: "Full grain leather with brass buckle.",
      price: 75.0,
      image: "/images/belt-leather.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Silk Pocket Square",
      description: "Hand-rolled edges.",
      price: 35.0,
      image: "/images/pocket-square.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Oxford Shoes",
      description: "Classic black leather lace-ups.",
      price: 220.0,
      image: "/images/shoes-oxford.jpg",
      categoryId: accCat.id,
    },
  ];

  for (const prod of products) {
    // Prevent duplicating products by finding if one with the same name exists first
    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name },
    });
    if (!existingProduct) {
      await prisma.product.create({
        data: prod,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
