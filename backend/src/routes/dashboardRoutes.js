const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

router.use(auth);
router.get('/summary', auth.adminOnly, controller.getDashboard);

module.exports = router;