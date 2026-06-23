import { db } from './src/lib/db';
import { hash } from 'bcryptjs';

// Cloudinary-optimized image URLs (auto format + quality)
const C = "https://res.cloudinary.com/dwheha9pb/image/upload/f_auto,q_auto";

const SHOE_IMAGES = [
  `${C}/v1782219939/roshni/products/shoes/roshni/products/shoes/26db86ee5f57`,
  `${C}/v1782219942/roshni/products/shoes/roshni/products/shoes/a0490d9780a2`,
  `${C}/v1782219946/roshni/products/shoes/roshni/products/shoes/0e221ea461ad`,
  `${C}/v1782219949/roshni/products/shoes/roshni/products/shoes/6644952f5d4e`,
  `${C}/v1782219952/roshni/products/shoes/roshni/products/shoes/0db449c54646`,
  `${C}/v1782219955/roshni/products/shoes/roshni/products/shoes/e8f006b4fce7`,
];

const BAG_IMAGES = [
  `${C}/v1782219959/roshni/products/bags/roshni/products/bags/fd76ca060f26`,
  `${C}/v1782219967/roshni/products/bags/roshni/products/bags/feb8e60ce1bd`,
  `${C}/v1782219972/roshni/products/bags/roshni/products/bags/e58d18e29fe6`,
  `${C}/v1782219975/roshni/products/bags/roshni/products/bags/0d6395d212ee`,
  `${C}/v1782219979/roshni/products/bags/roshni/products/bags/88d000320807`,
  `${C}/v1782219983/roshni/products/bags/roshni/products/bags/45407a4717ad`,
];

const ACCESSORY_IMAGES = [
  `${C}/v1782219988/roshni/products/accessories/roshni/products/accessories/a65c3442423c`,
  `${C}/v1782219991/roshni/products/accessories/roshni/products/accessories/502ba51339f0`,
  `${C}/v1782219995/roshni/products/accessories/roshni/products/accessories/2aaed63dd38f`,
  `${C}/v1782219998/roshni/products/accessories/roshni/products/accessories/dfe81ca5f173`,
  `${C}/v1782220001/roshni/products/accessories/roshni/products/accessories/aae7a971ddb4`,
  `${C}/v1782220004/roshni/products/accessories/roshni/products/accessories/618d3b5e6187`,
];

const BANNER_IMAGES = [
  `${C}/v1782220007/roshni/products/banners/roshni/products/banners/f97f8dc22c20`,
  `${C}/v1782220011/roshni/products/banners/roshni/products/banners/08e1a3375306`,
  `${C}/v1782220014/roshni/products/banners/roshni/products/banners/8aa77811abe7`,
  `${C}/v1782220018/roshni/products/banners/roshni/products/banners/05297c04e4da`,
];

async function seed() {
  console.log("🌱 Seeding database...");

  await db.payment.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.promoCode.deleteMany();
  await db.banner.deleteMany();
  await db.storeSetting.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  // Main categories
  const shoesCategory = await db.category.create({ data: { name: "Shoes", slug: "shoes", image: SHOE_IMAGES[0], order: 1 } });
  const bagsCategory = await db.category.create({ data: { name: "Handbags", slug: "handbags", image: BAG_IMAGES[0], order: 2 } });
  const accessoriesCategory = await db.category.create({ data: { name: "Accessories", slug: "accessories", image: ACCESSORY_IMAGES[0], order: 3 } });

  // Subcategories
  const heelsSub = await db.category.create({ data: { name: "Heels", slug: "heels", image: SHOE_IMAGES[1], parentId: shoesCategory.id, order: 1 } });
  const flatsSub = await db.category.create({ data: { name: "Flats", slug: "flats", image: SHOE_IMAGES[3], parentId: shoesCategory.id, order: 2 } });
  const sandalsSub = await db.category.create({ data: { name: "Sandals", slug: "sandals", image: SHOE_IMAGES[5], parentId: shoesCategory.id, order: 3 } });
  const totesSub = await db.category.create({ data: { name: "Tote Bags", slug: "tote-bags", image: BAG_IMAGES[1], parentId: bagsCategory.id, order: 1 } });
  const clutchesSub = await db.category.create({ data: { name: "Clutches", slug: "clutches", image: BAG_IMAGES[3], parentId: bagsCategory.id, order: 2 } });
  const crossbodySub = await db.category.create({ data: { name: "Crossbody", slug: "crossbody-bags", image: BAG_IMAGES[5], parentId: bagsCategory.id, order: 3 } });
  const jewelrySub = await db.category.create({ data: { name: "Jewelry", slug: "jewelry", image: ACCESSORY_IMAGES[1], parentId: accessoriesCategory.id, order: 1 } });
  const scarvesSub = await db.category.create({ data: { name: "Scarves", slug: "scarves", image: ACCESSORY_IMAGES[3], parentId: accessoriesCategory.id, order: 2 } });
  const beltsSub = await db.category.create({ data: { name: "Belts", slug: "belts", image: ACCESSORY_IMAGES[5], parentId: accessoriesCategory.id, order: 3 } });

  // Products data
  const products = [
    // Shoes
    { name: "Rose Gold Stiletto Heels", slug: "rose-gold-stiletto-heels", description: "Elegant rose gold stiletto heels perfect for evening events and special occasions. Crafted with premium leather and a comfortable padded insole.", price: 4500, discountPrice: 3500, stock: 15, images: [SHOE_IMAGES[0], SHOE_IMAGES[1]], tags: ["heels", "evening", "party", "rose-gold"], isTrending: true, isNewArrival: false, categoryId: heelsSub.id, variants: [{ size: "36", stock: 3 }, { size: "37", stock: 4 }, { size: "38", stock: 5 }, { size: "39", stock: 2 }, { size: "40", stock: 1 }] },
    { name: "Classic Black Pumps", slug: "classic-black-pumps", description: "Timeless black pumps that every woman needs. Versatile enough for office wear or a night out. Premium patent leather finish.", price: 3800, discountPrice: null, stock: 25, images: [SHOE_IMAGES[1], SHOE_IMAGES[4]], tags: ["heels", "classic", "office", "black"], isTrending: true, isNewArrival: false, categoryId: heelsSub.id, variants: [{ size: "36", stock: 5 }, { size: "37", stock: 6 }, { size: "38", stock: 7 }, { size: "39", stock: 4 }, { size: "40", stock: 3 }] },
    { name: "Nude Block Heel Sandals", slug: "nude-block-heel-sandals", description: "Comfortable yet stylish nude block heel sandals. Perfect for all-day wear with adjustable ankle straps.", price: 2800, discountPrice: 2200, stock: 30, images: [SHOE_IMAGES[2], SHOE_IMAGES[5]], tags: ["sandals", "casual", "nude", "comfortable"], isTrending: false, isNewArrival: true, categoryId: sandalsSub.id, variants: [{ size: "36", stock: 6 }, { size: "37", stock: 8 }, { size: "38", stock: 10 }, { size: "39", stock: 4 }, { size: "40", stock: 2 }] },
    { name: "Beige Wedge Espadrilles", slug: "beige-wedge-espadrilles", description: "Chic beige wedge espadrilles with woven jute detail. A summer essential that pairs beautifully with dresses and skirts.", price: 3200, discountPrice: null, stock: 18, images: [SHOE_IMAGES[3]], tags: ["wedges", "summer", "casual", "beige"], isTrending: false, isNewArrival: true, categoryId: sandalsSub.id, variants: [{ size: "37", stock: 5 }, { size: "38", stock: 7 }, { size: "39", stock: 6 }] },
    { name: "Silver Glitter Flats", slug: "silver-glitter-flats", description: "Sparkling silver glitter flats for festive occasions. Comfortable flat sole with dazzling glitter upper.", price: 2200, discountPrice: 1800, stock: 20, images: [SHOE_IMAGES[4], SHOE_IMAGES[0]], tags: ["flats", "party", "silver", "glitter"], isTrending: true, isNewArrival: false, categoryId: flatsSub.id, variants: [{ size: "36", stock: 4 }, { size: "37", stock: 5 }, { size: "38", stock: 6 }, { size: "39", stock: 3 }, { size: "40", stock: 2 }] },
    { name: "White Minimalist Sneakers", slug: "white-minimalist-sneakers", description: "Clean white minimalist sneakers crafted from genuine leather. Perfect for casual chic everyday styling.", price: 3500, discountPrice: 2900, stock: 35, images: [SHOE_IMAGES[5], SHOE_IMAGES[2]], tags: ["flats", "casual", "white", "sneakers"], isTrending: true, isNewArrival: true, categoryId: flatsSub.id, variants: [{ size: "37", stock: 7 }, { size: "38", stock: 10 }, { size: "39", stock: 8 }, { size: "40", stock: 6 }, { size: "41", stock: 4 }] },
    // Bags
    { name: "Tan Leather Tote Bag", slug: "tan-leather-tote-bag", description: "Spacious tan leather tote bag with interior pockets. Perfect for work and everyday essentials. Genuine full-grain leather.", price: 6500, discountPrice: 5200, stock: 12, images: [BAG_IMAGES[0], BAG_IMAGES[1]], tags: ["tote", "leather", "work", "tan"], isTrending: true, isNewArrival: false, categoryId: totesSub.id, variants: [{ color: "Tan", stock: 7 }, { color: "Black", stock: 5 }] },
    { name: "Black Quilted Crossbody", slug: "black-quilted-crossbody", description: "Elegant black quilted crossbody bag with gold chain strap. Compact yet roomy enough for all your essentials.", price: 4800, discountPrice: null, stock: 20, images: [BAG_IMAGES[1], BAG_IMAGES[4]], tags: ["crossbody", "quilted", "black", "elegant"], isTrending: true, isNewArrival: false, categoryId: crossbodySub.id, variants: [{ color: "Black", stock: 10 }, { color: "Navy", stock: 10 }] },
    { name: "Blush Pink Clutch", slug: "blush-pink-clutch", description: "Delicate blush pink clutch with crystal embellishment. The perfect finishing touch for any evening outfit.", price: 3200, discountPrice: 2500, stock: 15, images: [BAG_IMAGES[2], BAG_IMAGES[5]], tags: ["clutch", "evening", "pink", "crystal"], isTrending: false, isNewArrival: true, categoryId: clutchesSub.id, variants: [{ color: "Blush Pink", stock: 8 }, { color: "Gold", stock: 7 }] },
    { name: "Cream Woven Shoulder Bag", slug: "cream-woven-shoulder-bag", description: "Handcrafted cream woven shoulder bag with leather trim. A beautiful statement piece for summer outings.", price: 5500, discountPrice: null, stock: 8, images: [BAG_IMAGES[3]], tags: ["shoulder", "woven", "summer", "cream"], isTrending: false, isNewArrival: true, categoryId: totesSub.id, variants: [{ color: "Cream", stock: 8 }] },
    { name: "Burgundy Mini Saddle Bag", slug: "burgundy-mini-saddle-bag", description: "Trendy burgundy mini saddle bag with adjustable strap. Compact design that holds all your daily essentials.", price: 4200, discountPrice: 3500, stock: 18, images: [BAG_IMAGES[4], BAG_IMAGES[0]], tags: ["crossbody", "mini", "burgundy", "trendy"], isTrending: true, isNewArrival: true, categoryId: crossbodySub.id, variants: [{ color: "Burgundy", stock: 10 }, { color: "Forest Green", stock: 8 }] },
    { name: "Brown Structured Handbag", slug: "brown-structured-handbag", description: "Sophisticated brown structured handbag with top handle and detachable shoulder strap. Multiple compartments for organization.", price: 7200, discountPrice: 5800, stock: 10, images: [BAG_IMAGES[5], BAG_IMAGES[2]], tags: ["handbag", "structured", "brown", "premium"], isTrending: false, isNewArrival: false, categoryId: totesSub.id, variants: [{ color: "Brown", stock: 5 }, { color: "Camel", stock: 5 }] },
    // Accessories
    { name: "Gold Layered Necklace Set", slug: "gold-layered-necklace-set", description: "Beautiful gold-toned layered necklace set featuring delicate chains of varying lengths. 18K gold-plated brass.", price: 1800, discountPrice: 1400, stock: 25, images: [ACCESSORY_IMAGES[0], ACCESSORY_IMAGES[1]], tags: ["necklace", "gold", "layered", "jewelry"], isTrending: true, isNewArrival: false, categoryId: jewelrySub.id, variants: [] },
    { name: "Pearl Drop Earrings", slug: "pearl-drop-earrings", description: "Classic pearl drop earrings with sterling silver hooks. Timeless elegance for any occasion.", price: 1200, discountPrice: null, stock: 30, images: [ACCESSORY_IMAGES[1], ACCESSORY_IMAGES[2]], tags: ["earrings", "pearl", "classic", "silver"], isTrending: true, isNewArrival: false, categoryId: jewelrySub.id, variants: [] },
    { name: "Silk Floral Scarf", slug: "silk-floral-scarf", description: "Luxurious 100% silk scarf with hand-painted floral design. Versatile accessory for neck, hair, or bag.", price: 2500, discountPrice: 2000, stock: 20, images: [ACCESSORY_IMAGES[2], ACCESSORY_IMAGES[3]], tags: ["scarf", "silk", "floral", "luxury"], isTrending: false, isNewArrival: true, categoryId: scarvesSub.id, variants: [] },
    { name: "Crystal Bracelet Collection", slug: "crystal-bracelet-collection", description: "Stunning crystal bracelet collection featuring rose quartz and clear quartz. Set of 3 stretch bracelets.", price: 2200, discountPrice: 1800, stock: 22, images: [ACCESSORY_IMAGES[3], ACCESSORY_IMAGES[4]], tags: ["bracelet", "crystal", "rose-quartz", "set"], isTrending: true, isNewArrival: true, categoryId: jewelrySub.id, variants: [] },
    { name: "Elegant Leather Belt", slug: "elegant-leather-belt", description: "Premium Italian leather belt with sleek gold buckle. A wardrobe essential that elevates any outfit.", price: 2800, discountPrice: null, stock: 16, images: [ACCESSORY_IMAGES[4], ACCESSORY_IMAGES[5]], tags: ["belt", "leather", "gold", "classic"], isTrending: false, isNewArrival: false, categoryId: beltsSub.id, variants: [{ size: "S", stock: 5 }, { size: "M", stock: 6 }, { size: "L", stock: 5 }] },
    { name: "Statement Cocktail Ring", slug: "statement-cocktail-ring", description: "Bold cocktail ring featuring an oversized cubic zirconia stone in rose gold setting. Adjustable band.", price: 1500, discountPrice: 1200, stock: 28, images: [ACCESSORY_IMAGES[5], ACCESSORY_IMAGES[0]], tags: ["ring", "statement", "cocktail", "rose-gold"], isTrending: false, isNewArrival: true, categoryId: jewelrySub.id, variants: [] },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const productId = `prod_${i}`;
    
    await db.product.create({
      data: {
        id: productId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        images: JSON.stringify(p.images),
        categoryId: p.categoryId,
        tags: JSON.stringify(p.tags),
        isTrending: p.isTrending,
        isNewArrival: p.isNewArrival,
        viewCount: Math.floor(Math.random() * 500) + 50,
        orderCount: Math.floor(Math.random() * 30) + 5,
        variants: {
          create: p.variants.map((v, vi) => ({
            size: v.size || "",
            color: v.color || "",
            stock: v.stock,
            sku: `${p.slug}-${v.size || v.color || vi}`,
          })),
        },
      },
    });
  }

  // Banners
  await db.banner.createMany({
    data: [
      { image: BANNER_IMAGES[0], linkTarget: "products?category=shoes", title: "Summer Collection", subtitle: "Up to 30% off on all shoes", order: 1, isActive: true },
      { image: BANNER_IMAGES[1], linkTarget: "products?category=handbags", title: "New Arrivals", subtitle: "Discover our latest handbag collection", order: 2, isActive: true },
      { image: BANNER_IMAGES[2], linkTarget: "products?sale=true", title: "Flash Sale", subtitle: "Limited time offers on trending items", order: 3, isActive: true },
    ],
  });

  // Promo codes
  await db.promoCode.createMany({
    data: [
      { code: "WELCOME10", discount: 10, type: "percentage", minOrder: 1000, maxUses: 100, isActive: true },
      { code: "FLAT500", discount: 500, type: "fixed", minOrder: 3000, maxUses: 50, isActive: true },
      { code: "SUMMER25", discount: 25, type: "percentage", minOrder: 2000, maxUses: 30, isActive: true, expiresAt: new Date("2026-09-30") },
    ],
  });

  // Store settings
  await db.storeSetting.createMany({
    data: [
      { key: "storeName", value: "Roshni" },
      { key: "storeTagline", value: "Elegance Redefined" },
      { key: "storeDescription", value: "Discover curated collections of shoes, bags, and accessories for the modern woman." },
      { key: "currency", value: "৳" },
      { key: "currencyCode", value: "BDT" },
      { key: "shippingCost", value: "120" },
      { key: "freeShippingThreshold", value: "5000" },
      { key: "contactPhone", value: "+880 1XXX-XXXXXX" },
      { key: "contactEmail", value: "hello@roshni.com.bd" },
      { key: "facebookUrl", value: "https://facebook.com/roshni" },
      { key: "instagramUrl", value: "https://instagram.com/roshni" },
    ],
  });

  // Users
  const adminPassword = await hash("admin123", 12);
  const admin = await db.user.create({
    data: { name: "Admin", email: "admin@roshni.com", phone: "01700000000", passwordHash: adminPassword, role: "admin" },
  });

  const customerPassword = await hash("customer123", 12);
  const customer = await db.user.create({
    data: {
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
      phone: "01800000000",
      passwordHash: customerPassword,
      role: "customer",
      addresses: JSON.stringify([
        { id: "addr1", name: "Nusrat Jahan", phone: "01800000000", address: "House 12, Road 5, Dhanmondi", city: "Dhaka", district: "Dhaka", isDefault: true },
      ]),
    },
  });

  // Sample orders
  await db.order.createMany({
    data: [
      {
        orderNumber: "RSH-20260622-001",
        userId: customer.id,
        items: JSON.stringify([{ productId: "prod_0", name: "Rose Gold Stiletto Heels", price: 3500, quantity: 1, variant: "Size: 38", image: SHOE_IMAGES[0] }]),
        shippingAddress: JSON.stringify({ name: "Nusrat Jahan", phone: "01800000000", address: "House 12, Road 5, Dhanmondi", city: "Dhaka", district: "Dhaka" }),
        status: "delivered",
        total: 3620,
        subtotal: 3500,
        shippingCost: 120,
        paymentProvider: "bkash",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: "RSH-20260622-002",
        userId: customer.id,
        items: JSON.stringify([
          { productId: "prod_6", name: "Tan Leather Tote Bag", price: 5200, quantity: 1, variant: "Color: Tan", image: BAG_IMAGES[0] },
          { productId: "prod_12", name: "Gold Layered Necklace Set", price: 1400, quantity: 2, variant: "", image: ACCESSORY_IMAGES[0] },
        ]),
        shippingAddress: JSON.stringify({ name: "Nusrat Jahan", phone: "01800000000", address: "House 12, Road 5, Dhanmondi", city: "Dhaka", district: "Dhaka" }),
        status: "shipped",
        total: 8120,
        subtotal: 8000,
        shippingCost: 120,
        paymentProvider: "nagad",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: "RSH-20260622-003",
        userId: customer.id,
        items: JSON.stringify([{ productId: "prod_4", name: "Silver Glitter Flats", price: 1800, quantity: 1, variant: "Size: 37", image: SHOE_IMAGES[4] }]),
        shippingAddress: JSON.stringify({ name: "Nusrat Jahan", phone: "01800000000", address: "House 12, Road 5, Dhanmondi", city: "Dhaka", district: "Dhaka" }),
        status: "processing",
        total: 1920,
        subtotal: 1800,
        shippingCost: 120,
        paymentProvider: "bkash",
        paymentStatus: "completed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Seeding complete!");
  console.log(`   Admin: admin@roshni.com / admin123`);
  console.log(`   Customer: nusrat@example.com / customer123`);
  console.log(`   3 categories, 9 subcategories, 18 products, 3 banners, 3 promo codes, 3 orders`);
}

seed().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(async () => { await db.$disconnect(); });