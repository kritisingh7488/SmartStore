const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake-key');

// Helper: retry with exponential backoff for rate limits
const callGeminiWithRetry = async (model, prompt, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = (i + 1) * 3000; // 3s, 6s, 9s
        console.log(`Rate limited, retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// @desc    Generate all AI content for a product
// @route   POST /api/ai/generate/:id
// @access  Private
const generateProductContent = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Fallback data in case Gemini rate limits us
    const adjectives = ['premium', 'exclusive', 'innovative', 'high-quality', 'essential', 'top-tier', 'sleek', 'versatile', 'modern'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const capitalize = s => s && s[0].toUpperCase() + s.slice(1);

    const fallbackData = {
      description: `Discover the ultimate ${product.name}, specifically designed for those who appreciate ${randomAdjective} craftsmanship. As a standout in our ${product.category} collection, it offers unbeatable value at just $${product.basePrice}. \n\nWhether you need reliability for everyday use or a perfect gift, this item is built to exceed expectations. Upgrade your lifestyle with this must-have ${product.category.toLowerCase()} essential today.`,
      seoTags: [product.category, randomAdjective, product.name.split(" ")[0].toLowerCase(), "best value", "trending now"],
      marketingCaption: `Elevate your game with the ${randomAdjective} ${product.name}! Available now for just $${product.basePrice}. ✨🛒`,
      keywords: [product.name.toLowerCase().split(" ").join("-"), `${product.category.toLowerCase()}-deals`, "buy now", randomAdjective, "limited stock"],
      shortTitle: `${capitalize(randomAdjective)} ${product.name.split(" ")[0]}`
    };

    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key, using fallback.');
      Object.assign(product, fallbackData);
      await product.save();
      return res.json(product);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are an expert e-commerce copywriter and SEO specialist.
      I have a product named "${product.name}" in the "${product.category}" category with a base price of $${product.basePrice}.
      
      Generate a JSON response with the following format:
      {
        "description": "A compelling, 2-paragraph product description that sells.",
        "seoTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "marketingCaption": "A single catchy marketing caption for social media (1-2 sentences).",
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
        "shortTitle": "A short, punchy product title (5 words max)."
      }
      Do not include any markdown formatting like \`\`\`json. Just the raw JSON.
    `;

    let generatedContent = fallbackData;
    try {
      const responseText = await callGeminiWithRetry(model, prompt, 2);
      generatedContent = JSON.parse(responseText);
    } catch (apiError) {
      console.log('Gemini API failed or rate limited. Using fallback data.');
      // Proceed with fallback data
    }

    product.description = generatedContent.description || fallbackData.description;
    product.seoTags = generatedContent.seoTags || fallbackData.seoTags;
    product.marketingCaption = generatedContent.marketingCaption || fallbackData.marketingCaption;
    product.keywords = generatedContent.keywords || fallbackData.keywords;
    product.shortTitle = generatedContent.shortTitle || fallbackData.shortTitle;
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ error: 'Failed to generate AI content. Please try again in a few seconds.' });
  }
};

// @desc    Improve existing description
// @route   POST /api/ai/improve/:id
// @access  Private
const improveDescription = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.description) return res.status(400).json({ error: 'No existing description to improve.' });

    const fallbackImproved = `✨ ${product.description} ✨\n\nNow upgraded with even more premium features! This ${product.name} is the absolute best choice in the ${product.category} category. Don't miss out on this exclusive offer.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Improve this product description for "${product.name}" (Category: ${product.category}, Price: $${product.basePrice}).
      Current: "${product.description}"
      Make it more compelling and SEO-friendly. Return ONLY the improved text, no JSON, no markdown.
    `;

    let improvedDescription = fallbackImproved;
    try {
      improvedDescription = await callGeminiWithRetry(model, prompt, 2);
    } catch (apiError) {
      console.log('Gemini API failed or rate limited. Using fallback improvement.');
    }
    
    product.description = improvedDescription;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error improving description:', error);
    res.status(500).json({ error: 'Failed to improve description. Please try again.' });
  }
};

// @desc    Generate AI Sales Suggestions
// @route   GET /api/ai/sales-suggestions
// @access  Admin
const getSalesSuggestions = async (req, res) => {
  try {
    const Sale = require('../models/Sale');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await Sale.aggregate([
      { $match: { saleDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$product', totalQuantity: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' }, category: { $first: '$category' } } },
      { $sort: { totalRevenue: -1 } }
    ]);

    const productIds = recentSales.map(s => s._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const allProducts = await Product.find({});

    const salesSummary = recentSales.map(s => {
      const p = products.find(prod => prod._id.toString() === s._id.toString());
      return { name: p?.name || 'Unknown', category: s.category || p?.category || 'General', unitsSold: s.totalQuantity, revenue: s.totalRevenue, currentStock: p?.stock || 0, price: p?.basePrice || 0 };
    });

    const lowStockProducts = allProducts.filter(p => p.stock < 10).map(p => ({ name: p.name, stock: p.stock, category: p.category }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are an AI sales analyst for an e-commerce store. Analyze this data and provide actionable suggestions.
      SALES DATA (Last 30 days): ${JSON.stringify(salesSummary)}
      LOW STOCK PRODUCTS: ${JSON.stringify(lowStockProducts)}
      
      Generate JSON:
      {
        "suggestions": [
          {"type": "trending", "message": "specific suggestion about trending products"},
          {"type": "warning", "message": "warning about slow-moving or low-stock items"},
          {"type": "pricing", "message": "pricing recommendation"},
          {"type": "opportunity", "message": "growth opportunity"},
          {"type": "summary", "message": "brief overall sales summary"}
        ]
      }
      Use actual product names. Keep each 1-2 sentences. No markdown. Raw JSON only.
    `;

    const responseText = await callGeminiWithRetry(model, prompt);
    
    let suggestions;
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      suggestions = { suggestions: [{ type: 'summary', message: 'Unable to parse AI insights. Please try again.' }] };
    }

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating sales suggestions:', error);
    // Return fallback instead of error so dashboard doesn't break
    res.json({ suggestions: [{ type: 'summary', message: 'AI suggestions temporarily unavailable. Click Refresh to try again.' }] });
  }
};

module.exports = { generateProductContent, improveDescription, getSalesSuggestions };
