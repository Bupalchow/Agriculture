const express = require('express');
const router = express.Router();
const profitController = require('../controllers/profitController');

// Add profit analysis
router.post('/add', profitController.addProfitAnalysis);

// Get profit analysis for a farmer
router.get('/:farmerId', profitController.getProfitAnalysisByFarmer);

module.exports = router;