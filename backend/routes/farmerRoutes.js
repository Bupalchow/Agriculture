const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

// Register a new farmer
router.post('/register', farmerController.register);

// Login a farmer
router.post('/login', farmerController.login);

module.exports = router;