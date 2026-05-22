const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstore');
    console.log('MongoDB Connected for Seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    console.log('Data cleared.');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });
    console.log('Admin user created (admin@example.com / password123)');

    // Create Regular User
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      isAdmin: false,
      bio: 'A passionate seller on SmartStore.',
    });
    console.log('Regular user created (john@example.com / password123)');

    // Create Products with categories and sellers
    const products = await Product.insertMany([
      { name: 'Wireless Noise-Canceling Headphones', basePrice: 199.99, stock: 45, category: 'Electronics', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', description: 'Experience pure audio bliss with our premium wireless noise-canceling headphones. Featuring advanced active noise cancellation and 30-hour battery life, these headphones are perfect for travel, work, and pure musical enjoyment.', seoTags: ['audio', 'wireless', 'headphones', 'noise-canceling'] },
      { name: 'Premium Running Shoes', basePrice: 129.99, stock: 8, category: 'Sports', seller: user._id, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', description: 'Engineered for maximum speed and comfort, these premium running shoes feature ultra-lightweight mesh and responsive cushioning. Perfect for marathon training or your daily jog.', seoTags: ['shoes', 'running', 'sports', 'fitness'] },
      { name: 'Organic Face Moisturizer', basePrice: 34.99, stock: 120, category: 'Beauty', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', description: 'Rejuvenate your skin with our 100% organic face moisturizer. Infused with natural botanicals and vitamins to provide deep hydration and a radiant glow all day long.', seoTags: ['beauty', 'skincare', 'organic', 'moisturizer'] },
      { name: 'Smart Home Speaker', basePrice: 89.99, stock: 60, category: 'Electronics', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&q=80', description: 'Control your smart home and enjoy room-filling sound with this intelligent speaker. Features voice control, seamless smart home integration, and stunning audio quality.', seoTags: ['smart home', 'speaker', 'tech', 'audio'] },
      { name: 'Leather Crossbody Bag', basePrice: 79.99, stock: 3, category: 'Fashion', seller: user._id, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', description: 'Elevate your everyday style with this genuine leather crossbody bag. Expertly crafted with premium materials, featuring adjustable straps and spacious interior compartments.', seoTags: ['fashion', 'bag', 'leather', 'accessories'] },
      { name: 'Stainless Steel Water Bottle', basePrice: 24.99, stock: 200, category: 'Sports', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', description: 'Keep your drinks ice-cold for 24 hours or piping hot for 12 with this premium insulated water bottle. Made from food-grade stainless steel, perfect for hiking or the gym.', seoTags: ['hydration', 'sports', 'bottle', 'eco-friendly'] },
      { name: 'Bamboo Desk Organizer', basePrice: 39.99, stock: 55, category: 'Home & Living', seller: user._id, imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80', description: 'Declutter your workspace with this elegant bamboo desk organizer. Features multiple compartments for pens, phones, and notepads, bringing a touch of nature to your office.', seoTags: ['office', 'organizer', 'bamboo', 'home decor'] },
      { name: 'Bluetooth Fitness Tracker', basePrice: 59.99, stock: 75, category: 'Electronics', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', description: 'Track your steps, heart rate, and sleep patterns accurately. This sleek fitness tracker helps you reach your health goals with real-time insights and a waterproof design.', seoTags: ['fitness', 'tracker', 'health', 'wearable'] },
      { name: 'Scented Soy Candle Set', basePrice: 19.99, stock: 0, category: 'Home & Living', seller: user._id, imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', description: 'Transform your home into a relaxing sanctuary with these hand-poured scented soy candles. Features soothing lavender and vanilla notes with a clean, long-lasting burn.', seoTags: ['candles', 'home', 'decor', 'relaxation'] },
      { name: 'Kids Building Blocks Set', basePrice: 29.99, stock: 90, category: 'Toys', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80', description: 'Unleash your child\'s creativity with this vibrant 200-piece building block set. Safe, durable, and designed to improve motor skills and spatial awareness in growing toddlers.', seoTags: ['toys', 'kids', 'educational', 'blocks'] },
      { name: 'Bestseller Novel Collection', basePrice: 49.99, stock: 40, category: 'Books', seller: user._id, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', description: 'Dive into three award-winning novels with this exclusive collection. Experience thrilling plots, deep character development, and unforgettable stories that will keep you reading all night.', seoTags: ['books', 'reading', 'novels', 'bestseller'] },
      { name: 'Gourmet Coffee Beans (1kg)', basePrice: 22.99, stock: 150, category: 'Food', seller: admin._id, imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&q=80', description: 'Start your morning right with our freshly roasted gourmet coffee beans. Ethically sourced and featuring a rich, smooth flavor profile with hints of dark chocolate and caramel.', seoTags: ['coffee', 'gourmet', 'food', 'beans'] },
    ]);
    console.log('Products seeded.');

    // Create richer Sales data (spanning 30 days, multiple categories)
    const salesData = [];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
      
      salesData.push({
        product: product._id,
        buyer: user._id,
        quantity,
        totalAmount: product.basePrice * quantity,
        category: product.category,
        saleDate: date,
        orderNumber: `ORD-${Math.floor(Math.random() * 900000) + 100000}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    await Sale.insertMany(salesData);
    console.log(`Sales data seeded (${salesData.length} records across 30 days).`);

    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
