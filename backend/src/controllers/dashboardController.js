const Product = require('../models/Product');

async function getDashboard(req, res) {
  const products = await Product.find({}).sort({ sales: -1, createdAt: -1 });

  const totalRevenue = products.reduce((sum, product) => sum + product.price * product.sales, 0);
  const totalCost = products.reduce((sum, product) => sum + product.cost * product.sales, 0);
  const profit = totalRevenue - totalCost;
  const lowStock = products.filter((product) => product.stock <= 5);
  const totalUnitsSold = products.reduce((sum, product) => sum + product.sales, 0);
  const topProducts = products.slice(0, 5).map((product) => ({
    id: product._id,
    name: product.name,
    sales: product.sales,
    revenue: product.price * product.sales,
    stock: product.stock,
    trendingScore: product.trendingScore
  }));

  const monthlyRevenue = [
    totalRevenue * 0.55,
    totalRevenue * 0.68,
    totalRevenue * 0.72,
    totalRevenue * 0.86,
    totalRevenue * 0.93,
    totalRevenue
  ];

  const salesSuggestions = [];
  if (products.length) {
    const underpriced = products.filter((product) => product.price - product.cost < product.price * 0.3);
    if (underpriced.length) {
      salesSuggestions.push('Raise margins on low-profit products with bundles or tiered pricing.');
    }
    if (lowStock.length) {
      salesSuggestions.push('Restock or create urgency campaigns for low stock products.');
    }
    salesSuggestions.push('Feature the highest-converting item in email and paid ads for the next sprint.');
  }

  return res.json({
    overview: {
      totalProducts: products.length,
      totalRevenue,
      profit,
      lowStockCount: lowStock.length,
      averageOrderValue: totalUnitsSold ? totalRevenue / totalUnitsSold : 0
    },
    monthlyRevenue,
    topProducts,
    lowStockProducts: lowStock.map((product) => ({
      id: product._id,
      name: product.name,
      stock: product.stock,
      sales: product.sales
    })),
    salesSuggestions: salesSuggestions.length ? salesSuggestions : ['Add products to generate AI recommendations.']
  });
}

module.exports = {
  getDashboard
};