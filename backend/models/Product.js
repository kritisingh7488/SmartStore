const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Other'],
  },
  status: {
    type: String,
    default: 'In Stock',
    enum: ['In Stock', 'Out of Stock'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
    default: '',
  },
  seoTags: {
    type: [String],
    default: [],
  },
  marketingCaption: {
    type: String,
    default: '',
  },
  keywords: {
    type: [String],
    default: [],
  },
  shortTitle: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Auto-set status based on stock
productSchema.pre('save', function () {
  this.status = this.stock > 0 ? 'In Stock' : 'Out of Stock';
});

module.exports = mongoose.model('Product', productSchema);
