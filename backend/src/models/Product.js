const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    sales: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    marketingCaption: {
      type: String,
      default: ''
    },
    pricingRecommendation: {
      type: String,
      default: ''
    },
    salesInsight: {
      type: String,
      default: ''
    },
    trendingScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);