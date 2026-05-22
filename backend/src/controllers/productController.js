const Product = require('../models/Product');
const generateProductContent = require('../services/gemini');

function scoreProduct(product) {
  const margin = Math.max(Number(product.price || 0) - Number(product.cost || 0), 0);
  const sales = Number(product.sales || 0);
  const stock = Number(product.stock || 0);
  const demandScore = Math.min(sales * 4, 45);
  const stockPenalty = stock <= 5 ? 12 : 0;
  const marginScore = Math.min(margin * 3, 30);

  return Math.max(15, Math.min(100, 40 + demandScore + marginScore - stockPenalty));
}

async function listProducts(req, res) {
  // Available to both customers and admins
  const products = await Product.find({}).sort({ createdAt: -1 });
  return res.json({ products });
}

async function createProduct(req, res) {
  const payload = req.body;
  if (!payload.name || !payload.category) {
    return res.status(400).json({ message: 'Name and category are required' });
  }

  const product = await Product.create({
    owner: req.user._id,
    name: payload.name,
    category: payload.category,
    price: Number(payload.price || 0),
    cost: Number(payload.cost || 0),
    stock: Number(payload.stock || 0),
    sales: Number(payload.sales || 0),
    description: payload.description || '',
    imageUrl: payload.imageUrl || '',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    marketingCaption: payload.marketingCaption || '',
    trendingScore: scoreProduct(payload)
  });

  return res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updates = req.body;
  product.name = updates.name ?? product.name;
  product.category = updates.category ?? product.category;
  product.price = updates.price !== undefined ? Number(updates.price) : product.price;
  product.cost = updates.cost !== undefined ? Number(updates.cost) : product.cost;
  product.stock = updates.stock !== undefined ? Number(updates.stock) : product.stock;
  product.sales = updates.sales !== undefined ? Number(updates.sales) : product.sales;
  product.description = updates.description ?? product.description;
  product.imageUrl = updates.imageUrl ?? product.imageUrl;
  product.tags = Array.isArray(updates.tags) ? updates.tags : product.tags;
  product.marketingCaption = updates.marketingCaption ?? product.marketingCaption;
  product.trendingScore = scoreProduct(product);

  await product.save();
  return res.json({ product });
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ message: 'Product deleted' });
}

async function generateContent(req, res) {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const aiContent = await generateProductContent(product);
  product.description = aiContent.description;
  product.tags = aiContent.tags;
  product.marketingCaption = aiContent.caption;
  product.pricingRecommendation = aiContent.pricingRecommendation;
  product.salesInsight = aiContent.salesInsight;
  await product.save();

  return res.json({
    product,
    aiContent
  });
}

async function purchaseProduct(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;

  const qty = Number(quantity || 1);
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.stock < qty) {
    return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} left.` });
  }

  product.stock -= qty;
  product.sales += qty;
  product.trendingScore = scoreProduct(product);
  await product.save();

  return res.json({ message: 'Purchase successful', product });
}

async function seedProducts(req, res) {
  const dummyProducts = [
    {
      name: 'Sea Salt Dark Chocolate Bar',
      category: 'Chocolates',
      price: 8.99,
      cost: 2.50,
      stock: 150,
      sales: 98,
      description: 'Award-winning 72% single-origin dark chocolate bar sprinkled with hand-harvested French fleur de sel. A delicate balance of intense cocoa and savory sea salt.',
      imageUrl: 'https://images.unsplash.com/photo-1548907040-4d42b52125ea?auto=format&fit=crop&w=600&q=80',
      tags: ['dark chocolate', 'organic', 'gourmet', 'sea salt'],
      marketingCaption: 'Savor the velvety depth of pure cocoa balanced by delicate crystals of sea salt.',
      pricingRecommendation: 'Top selling item with a 72% profit margin. Maintain price at $8.99 or introduce a 3-pack for $24.99.',
      salesInsight: 'High velocity and steady repeat purchases. Feature prominently at checkout and in social campaigns.',
      trendingScore: 92
    },
    {
      name: 'Chewy Caramel Pecan Cookie',
      category: 'Cookies',
      price: 4.50,
      cost: 1.10,
      stock: 80,
      sales: 145,
      description: 'Soft-baked brown butter cookie loaded with roasted pecans and stuffed with a molten, gooey caramel center. Baked fresh daily.',
      imageUrl: 'https://images.unsplash.com/photo-1558961317-19277d22f77b?auto=format&fit=crop&w=600&q=80',
      tags: ['cookies', 'caramel', 'pecan', 'bakery'],
      marketingCaption: 'Warm, gooey, and packed with buttery pecans—your coffee\'s new best friend.',
      pricingRecommendation: 'High sales volume. Test price at $4.99 or bundle with an espresso beverage.',
      salesInsight: 'Best seller in the baked goods category. Create weekend flash sales to boost foot traffic.',
      trendingScore: 97
    },
    {
      name: 'Red Velvet White Chip Macadamia',
      category: 'Cookies',
      price: 4.99,
      cost: 1.30,
      stock: 4,
      sales: 112,
      description: 'Vibrant cocoa-infused red velvet cookie dough packed with creamy white chocolate chips and toasted macadamia nuts. Crisp edges with a fudgy center.',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
      tags: ['cookies', 'red velvet', 'white chocolate', 'macadamia'],
      marketingCaption: 'Decadence meets crunch in every single bite of our Red Velvet Macadamia Cookie.',
      pricingRecommendation: 'Low stock levels. Keep price at $4.99 and prioritize immediate restock to satisfy demand.',
      salesInsight: 'Extremely high demand curve. Customers frequently buy these in boxes of 6 or 12.',
      trendingScore: 89
    },
    {
      name: 'Double Chocolate Fudge Brownie',
      category: 'Cookies',
      price: 5.50,
      cost: 1.50,
      stock: 65,
      sales: 85,
      description: 'Fudgy, dense chocolate brownie topped with chocolate chunks and a glossy, crinkly crust. A chocolate lover\'s absolute dream.',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      tags: ['brownies', 'fudge', 'chocolate', 'bakery'],
      marketingCaption: 'Guaranteed to satisfy your deepest chocolate cravings. Heat for 10 seconds for a molten treat.',
      pricingRecommendation: 'Healthy margin ($4.00). Try setting up a dessert bundle with premium milk.',
      salesInsight: 'Strong core performer, popular during late afternoon snack hours.',
      trendingScore: 78
    },
    {
      name: 'Gourmet Chocolate Truffle Box',
      category: 'Chocolates',
      price: 32.00,
      cost: 11.00,
      stock: 3,
      sales: 30,
      description: 'An elegant gift box of 12 hand-rolled Belgian chocolate truffles, featuring classic dark, milk hazelnut praline, and white raspberry fillings.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca87df46?auto=format&fit=crop&w=600&q=80',
      tags: ['truffles', 'gift box', 'belgian', 'assorted'],
      marketingCaption: 'Share the luxury of artisan Swiss and Belgian chocolate truffles.',
      pricingRecommendation: 'High profit margin. Increase price to $35.00 for holiday/weekend gifting.',
      salesInsight: 'Low stock count (3 left). High demand as gifts. Offer custom ribbon-wrapping at checkout.',
      trendingScore: 84
    },
    {
      name: 'French Macaron Assortment',
      category: 'Specialty',
      price: 24.99,
      cost: 7.20,
      stock: 40,
      sales: 65,
      description: 'A colorful boutique box of 8 delicate Parisian macarons. Flavors include Salted Caramel, Sicilian Pistachio, Madagascar Vanilla, and Dark Chocolate.',
      imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
      tags: ['macarons', 'french', 'almond', 'pistachio', 'gift'],
      marketingCaption: 'Dainty, light, and bursting with gourmet Parisian flavor.',
      pricingRecommendation: 'Price is solid. Bundle with gourmet teas to raise average order value.',
      salesInsight: 'Excellent aesthetic appeal. Display prominently on the storefront homepage.',
      trendingScore: 74
    }
  ];

  await Product.deleteMany({});
  const created = await Product.create(dummyProducts);
  return res.status(201).json({ message: 'Dummy data seeded successfully', count: created.length });
}

async function clearProducts(req, res) {
  await Product.deleteMany({});
  return res.json({ message: 'All products cleared successfully' });
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  generateContent,
  purchaseProduct,
  seedProducts,
  clearProducts
};