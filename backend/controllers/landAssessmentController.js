const axios = require('axios');
const db = require('../config/db');
const { generateLandRecommendations } = require('../utils/aiHelper');

const getLandAssessment = async (req, res) => {
    try {
        const {
            farmerId,
            location,
            landSize,
            soilType,
            soilPh,
            waterSource,
            previousCrop,
            organicFarming,
            budget,
            additionalInfo
        } = req.body;

        // Validate required fields
        if (!location || !landSize || !soilType || !soilPh || !waterSource) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Get weather forecast for the location
        let weatherData = {};
        try {
            // Extract city name for weather API
            const city = location.split(',')[0].trim();
            
            // Mock weather API call - in production, use a real weather API
            // For example: const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&days=7`);
            
            // Using mock data for demo
            weatherData = {
                location: city,
                current: {
                    temp_c: 28,
                    condition: { text: 'Partly cloudy' }
                },
                forecast: {
                    forecastday: [
                        { date: '2023-09-01', day: { avgtemp_c: 27, condition: { text: 'Sunny' } } },
                        { date: '2023-09-02', day: { avgtemp_c: 28, condition: { text: 'Partly cloudy' } } },
                        { date: '2023-09-03', day: { avgtemp_c: 26, condition: { text: 'Light rain' } } }
                    ]
                }
            };
        } catch (weatherError) {
            console.error('Weather API error:', weatherError);
            // Continue even if weather API fails
            weatherData = { error: 'Weather data unavailable' };
        }

        // Generate recommendations using AI
        const recommendations = await generateLandRecommendations({
            location,
            landSize,
            soilType,
            soilPh,
            waterSource,
            previousCrop,
            organicFarming,
            budget,
            additionalInfo,
            weatherData
        });

        res.status(200).json(recommendations);
    } catch (err) {
        console.error('Land assessment error:', err);
        res.status(500).json({ error: 'Failed to process land assessment' });
    }
};

const saveAssessment = async (req, res) => {
    try {
        const { farmerId, landDetails, recommendations } = req.body;
        
        if (!farmerId || !landDetails || !recommendations) {
            return res.status(400).json({ error: 'Required data missing' });
        }

        // Save the assessment details to the database
        const [result] = await db.query(
            `INSERT INTO land_assessments 
            (farmer_id, location, land_size, soil_type, soil_ph, water_source, 
            previous_crop, organic_farming, budget, additional_info, recommendations) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farmerId,
                landDetails.location,
                landDetails.landSize,
                landDetails.soilType,
                landDetails.soilPh,
                landDetails.waterSource,
                landDetails.previousCrop || null,
                landDetails.organicFarming ? 1 : 0,
                landDetails.budget || null,
                landDetails.additionalInfo || null,
                JSON.stringify(recommendations)
            ]
        );

        res.status(201).json({ 
            message: 'Assessment saved successfully', 
            assessmentId: result.insertId 
        });
    } catch (err) {
        console.error('Error saving assessment:', err);
        res.status(500).json({ error: 'Failed to save assessment' });
    }
};

const getAssessmentsByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;
        
        if (!farmerId) {
            return res.status(400).json({ error: 'Farmer ID is required' });
        }

        const [assessments] = await db.query(
            `SELECT id, farmer_id, location, soil_type, land_size, created_at as createdAt 
             FROM land_assessments 
             WHERE farmer_id = ? 
             ORDER BY created_at DESC`,
            [farmerId]
        );

        res.status(200).json(assessments);
    } catch (err) {
        console.error('Error fetching assessments:', err);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
};

const getAssessmentDetails = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        
        if (!assessmentId) {
            return res.status(400).json({ error: 'Assessment ID is required' });
        }

        const [assessments] = await db.query(
            `SELECT * FROM land_assessments WHERE id = ?`,
            [assessmentId]
        );

        if (assessments.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const assessment = assessments[0];
        
        // Parse the recommendations JSON string back to an object
        assessment.recommendations = JSON.parse(assessment.recommendations);

        res.status(200).json(assessment);
    } catch (err) {
        console.error('Error fetching assessment details:', err);
        res.status(500).json({ error: 'Failed to fetch assessment details' });
    }
};

module.exports = { 
    getLandAssessment, 
    saveAssessment, 
    getAssessmentsByFarmer, 
    getAssessmentDetails 
};
