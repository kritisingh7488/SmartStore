const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all orders (sales)
// @route   GET /api/orders
// @access  Admin
const getOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // For search by orderNumber
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const orders = await Sale.find(query)
      .populate('product', 'name category basePrice imageUrl')
      .populate('buyer', 'name email')
      .sort({ saleDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Sale.countDocuments(query);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Sale.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Invalid order data' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Sale.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  deleteOrder,
};
