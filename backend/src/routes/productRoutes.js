const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/productController');

// All product routes require at least being logged in
router.use(auth);

// Shared/Customer routes
router.get('/', controller.listProducts);
router.post('/:id/purchase', controller.purchaseProduct);

// Admin-only protected routes
router.post('/seed', auth.adminOnly, controller.seedProducts);
router.post('/clear', auth.adminOnly, controller.clearProducts);
router.post('/', auth.adminOnly, controller.createProduct);
router.post('/:id/generate', auth.adminOnly, controller.generateContent);
router.put('/:id', auth.adminOnly, controller.updateProduct);
router.delete('/:id', auth.adminOnly, controller.deleteProduct);

module.exports = router;