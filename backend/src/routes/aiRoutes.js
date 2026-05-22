const router = require('express').Router();
const auth = require('../middleware/auth');
const generateProductContent = require('../services/gemini');

router.use(auth);

router.post('/generate', async (req, res) => {
  const { name, category, price, stock, sales, cost } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ message: 'Name and category are required' });
  }

  const aiContent = await generateProductContent({ name, category, price, stock, sales, cost });
  return res.json({ aiContent });
});

module.exports = router;