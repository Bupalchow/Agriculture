const express = require('express');
const router = express.Router();
const landAssessmentController = require('../controllers/landAssessmentController');

// Get land assessment and recommendations
router.post('/', landAssessmentController.getLandAssessment);

// Save a land assessment
router.post('/save', landAssessmentController.saveAssessment);

// Get all assessments for a farmer
router.get('/:farmerId', landAssessmentController.getAssessmentsByFarmer);

// Get details of a specific assessment
router.get('/details/:assessmentId', landAssessmentController.getAssessmentDetails);

module.exports = router;
