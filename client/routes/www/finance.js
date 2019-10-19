const express         = require('express');
const router = express.Router();

// @route GET /finance
// @desc HTML web page with finance summary
// @access Public
// TODO: ALTER THIS TO BRING IN DATA ASYNCHRONOUSLY
router.get('/', (req, res) => {
    res.render('finance/summary');
});

// @route GET /finance/modify
// @desc HTML web page to allow user to register new, or edit existing financial information
// @access Public
// TODO: ALTER THIS TO BRING DATA IN ASYNCHRONOUSLY
router.get('/modify', (req, res) => {
    res.render('finance/modify');
});

module.exports = router;
