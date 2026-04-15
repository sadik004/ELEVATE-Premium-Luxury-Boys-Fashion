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
      slug: "midnight-blue-wool-suit",
      description: "Classic fit, 100% fine wool.",
      price: 450.0,
      image: "/images/suit-blue.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Charcoal Grey Tuxedo",
      slug: "charcoal-grey-tuxedo",
      description: "Elegant evening wear.",
      price: 550.0,
      image: "/images/tux-grey.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Ivory Linen Suit",
      slug: "ivory-linen-suit",
      description: "Perfect for summer events.",
      price: 380.0,
      image: "/images/suit-ivory.jpg",
      categoryId: suitsCat.id,
    },
    {
      name: "Velvet Dinner Jacket",
      slug: "velvet-dinner-jacket",
      description: "Plush velvet jacket with satin lapels.",
      price: 400.0,
      image: "/images/jacket-velvet.jpg",
      categoryId: suitsCat.id,
    },
    // Shirts
    {
      name: "Crisp White Poplin Shirt",
      slug: "crisp-white-poplin-shirt",
      description: "Essential formal shirt.",
      price: 120.0,
      image: "/images/shirt-white.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Light Blue Oxford",
      slug: "light-blue-oxford",
      description: "Versatile button-down.",
      price: 110.0,
      image: "/images/shirt-blue.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Silk Blend Dress Shirt",
      slug: "silk-blend-dress-shirt",
      description: "Luxurious feel and subtle sheen.",
      price: 180.0,
      image: "/images/shirt-silk.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Pinstripe Formal Shirt",
      slug: "pinstripe-formal-shirt",
      description: "Classic business styling adapted for boys.",
      price: 130.0,
      image: "/images/shirt-stripe.jpg",
      categoryId: shirtsCat.id,
    },
    {
      name: "Black Cotton T-Shirt",
      slug: "black-cotton-t-shirt",
      description: "Premium casual staple.",
      price: 60.0,
      image: "/images/tshirt-black.jpg",
      categoryId: shirtsCat.id,
    },
    // Trousers
    {
      name: "Tailored Wool Trousers",
      slug: "tailored-wool-trousers",
      description: "Pleated wool blend trousers.",
      price: 150.0,
      image: "/images/pants-wool.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Cotton Chinos",
      slug: "cotton-chinos",
      description: "Smart casual essential.",
      price: 95.0,
      image: "/images/pants-chinos.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Linen Shorts",
      slug: "linen-shorts",
      description: "Breathable summer wear.",
      price: 80.0,
      image: "/images/shorts-linen.jpg",
      categoryId: pantsCat.id,
    },
    {
      name: "Formal Tuxedo Pants",
      slug: "formal-tuxedo-pants",
      description: "Matching trousers with satin stripe.",
      price: 180.0,
      image: "/images/pants-tux.jpg",
      categoryId: pantsCat.id,
    },
    // Outerwear
    {
      name: "Cashmere Blend Overcoat",
      slug: "cashmere-blend-overcoat",
      description: "Winter luxury.",
      price: 650.0,
      image: "/images/coat-cashmere.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Trench Coat",
      slug: "trench-coat",
      description: "Classic water-resistant design.",
      price: 320.0,
      image: "/images/coat-trench.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Leather Biker Jacket",
      slug: "leather-biker-jacket",
      description: "Edgy yet refined.",
      price: 480.0,
      image: "/images/jacket-leather.jpg",
      categoryId: outCat.id,
    },
    {
      name: "Quilted Vest",
      slug: "quilted-vest",
      description: "Layering piece for transitional weather.",
      price: 210.0,
      image: "/images/vest-quilted.jpg",
      categoryId: outCat.id,
    },
    // Accessories
    {
      name: "Silk Bow Tie",
      slug: "silk-bow-tie",
      description: "Pre-tied black silk.",
      price: 45.0,
      image: "/images/tie-bow.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Leather Belt",
      slug: "leather-belt",
      description: "Full grain leather with brass buckle.",
      price: 75.0,
      image: "/images/belt-leather.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Silk Pocket Square",
      slug: "silk-pocket-square",
      description: "Hand-rolled edges.",
      price: 35.0,
      image: "/images/pocket-square.jpg",
      categoryId: accCat.id,
    },
    {
      name: "Oxford Shoes",
      slug: "oxford-shoes",
      description: "Classic black leather lace-ups.",
      price: 220.0,
      image: "/images/shoes-oxford.jpg",
      categoryId: accCat.id,
    },
  ];

  const processedProducts = products.map((p) => ({
    ...p,
    description: p.description || "Premium product",
    image: p.image || "https://via.placeholder.com/300",
  }));

  await prisma.product.createMany({
    data: processedProducts,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
