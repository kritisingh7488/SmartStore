const express = require('express');
const router = express.Router();
const { generateProductContent, improveDescription, getSalesSuggestions } = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/generate/:id', protect, generateProductContent);
router.post('/improve/:id', protect, improveDescription);
router.get('/sales-suggestions', protect, adminOnly, getSalesSuggestions);

module.exports = router;
