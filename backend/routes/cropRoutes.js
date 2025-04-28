const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

router.post('/add', cropController.addCrop);
router.get('/:farmerId', cropController.getCropsByFarmer);
router.get('/details/:cropId', cropController.getCropById); // Add this new route
router.post('/chat', cropController.handleCropChat);
module.exports = router;