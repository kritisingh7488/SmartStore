function fallbackInsight(product) {
  const name = product.name.toLowerCase();
  let desc = `${product.name} is a gourmet ${product.category.toLowerCase()} favorite. Baked fresh using premium ingredients, this treat offers a perfect blend of texture and flavor.`;
  let caption = `Indulge in our freshly baked ${product.name}! Made with luxury ingredients to satisfy your sweet tooth. 🍪🍫`;
  let tags = [product.category.toLowerCase(), 'bakery', 'gourmet', 'freshly-baked'];

  if (name.includes('chocolate') || name.includes('truffle') || name.includes('fudge') || name.includes('praline')) {
    desc = `Premium artisan ${product.name} made with single-origin rich dark chocolate and natural cocoa butter. Creamy, melt-in-your-mouth texture with a sophisticated flavor profile.`;
    caption = `Velvety, rich, and absolutely decadent: taste the difference of premium artisan cocoa with our ${product.name}. 🍫✨`;
    tags.push('chocolate', 'cocoa', 'indulgence');
  } else if (name.includes('cookie') || name.includes('macaron') || name.includes('baked') || name.includes('brownie')) {
    desc = `Baked fresh daily using gourmet brown butter and natural sugars. Crisp golden-brown edges with a soft, chewy center that melts in your mouth.`;
    caption = `Fresh out of the oven! 🍪 Warm, sweet, and perfectly chewy: our ${product.name} is the ultimate comfort treat.`;
    tags.push('cookies', 'pastry', 'chewy');
  }

  const margin = Number(product.price || 0) - Number(product.cost || 0);
  const marginPct = product.price ? (margin / product.price) * 100 : 0;
  
  let pricingRecommendation = `Current price of $${Number(product.price || 0).toFixed(2)} is optimal. Try offering a 'Baker's Dozen' bundle for sweet pairings.`;
  if (marginPct < 40) {
    pricingRecommendation = `Low profit margin (${marginPct.toFixed(1)}%). Consider raising price by 15% to $${(Number(product.price || 0) * 1.15).toFixed(2)} or offering as a coffee-pairing bundle to lift order value.`;
  } else if (marginPct > 65) {
    pricingRecommendation = `Excellent profit margin (${marginPct.toFixed(1)}%). Maintain $${Number(product.price || 0).toFixed(2)} and test free decorative box packaging for gifting seasons.`;
  }

  let salesInsight = 'High sales velocity. Position at the top of the storefront page or offer discount coupons on checkout.';
  if (Number(product.stock || 0) <= 5) {
    salesInsight = `Low inventory alert! Only ${product.stock} items left. Prioritize baking a fresh batch immediately to capture ongoing demand.`;
  } else if (Number(product.sales || 0) < 10) {
    salesInsight = 'Lower sales velocity. Boost engagement by sharing high-fidelity images of baking ingredients on social media.';
  }

  return {
    description: desc,
    tags: Array.from(new Set(tags)).slice(0, 6),
    caption: caption,
    pricingRecommendation,
    salesInsight,
    trendingKeywords: [product.category.toLowerCase(), 'artisan-bakes', 'gourmet-pastry']
  };
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }

  return JSON.parse(cleaned);
}

async function generateProductContent(product) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackInsight(product);
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const prompt = `You are an AI e-commerce copywriter. Return only JSON with these keys: description, tags, caption, pricingRecommendation, salesInsight, trendingKeywords.\nProduct: ${JSON.stringify({
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    sales: product.sales,
    cost: product.cost
  })}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    return fallbackInsight(product);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return fallbackInsight(product);
  }

  try {
    const parsed = extractJson(text);
    return {
      description: parsed.description || fallbackInsight(product).description,
      tags: Array.isArray(parsed.tags) ? parsed.tags : fallbackInsight(product).tags,
      caption: parsed.caption || fallbackInsight(product).caption,
      pricingRecommendation: parsed.pricingRecommendation || fallbackInsight(product).pricingRecommendation,
      salesInsight: parsed.salesInsight || fallbackInsight(product).salesInsight,
      trendingKeywords: Array.isArray(parsed.trendingKeywords) ? parsed.trendingKeywords : fallbackInsight(product).trendingKeywords
    };
  } catch (error) {
    return fallbackInsight(product);
  }
}

module.exports = generateProductContent;