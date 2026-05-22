const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get full dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    // Total Revenue
    const revenueResult = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Total Users
    const totalUsers = await User.countDocuments({ isAdmin: false });

    // Low Stock Alert (products with stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select('name stock category');

    // Total Sales Count
    const totalSalesCount = await Sale.countDocuments();

    // Revenue over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesOverTime = await Sale.aggregate([
      { $match: { saleDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly Sales (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top Selling Products
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          category: '$productInfo.category',
          totalQuantity: 1,
          totalRevenue: 1,
        }
      }
    ]);

    // Category-wise Sales (for Pie Chart)
    const categorySales = await Sale.aggregate([
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Recent Sales (last 10)
    const recentSales = await Sale.find({})
      .populate('product', 'name category')
      .sort({ saleDate: -1 })
      .limit(10);

    res.json({
      totalRevenue,
      totalProducts,
      totalUsers,
      totalSalesCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      salesOverTime,
      monthlySales,
      topProducts,
      categorySales,
      recentSales,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
};

module.exports = { getDashboardStats };
