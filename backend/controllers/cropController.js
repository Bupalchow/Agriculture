const db = require('../config/db');
const { generateAITips } = require('../utils/aiHelper');

const addCrop = async (req, res) => {
    const { 
        farmer_id, 
        crop_name, 
        planting_date, 
        expected_harvest_date, 
        soil_ph,
        variety,
        field_size,
        irrigation_type,
        previous_crop,
        fertilizers_used,
        additional_notes
    } = req.body;

    try {
        // Validate required fields
        if (!farmer_id || !crop_name || !planting_date || !expected_harvest_date || !soil_ph) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Generate AI tips with more context
        const tips = await generateAITips({ 
            crop_name, 
            soil_ph,
            variety,
            field_size,
            irrigation_type,
            previous_crop
        });

        // Insert crop into database with all fields
        const [result] = await db.query(
            `INSERT INTO crops (
                farmer_id, crop_name, planting_date, expected_harvest_date, 
                soil_ph, variety, field_size, irrigation_type, 
                previous_crop, fertilizers_used, additional_notes, tips
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farmer_id, crop_name, planting_date, expected_harvest_date,
                soil_ph, variety, field_size, irrigation_type,
                previous_crop, fertilizers_used, additional_notes, tips
            ]
        );

        res.status(201).json({ 
            message: 'Crop added successfully', 
            cropId: result.insertId
        });
    } catch (err) {
        console.error('Error adding crop:', err);
        res.status(500).json({ error: err.message });
    }
};

const getCropsByFarmer = async (req, res) => {
    const { farmerId } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM crops WHERE farmer_id = ?', [farmerId]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCropById = async (req, res) => {
    const { cropId } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT 
                c.*,
                DATEDIFF(CURRENT_DATE, c.planting_date) as crop_age_days,
                DATEDIFF(c.expected_harvest_date, CURRENT_DATE) as days_until_harvest
            FROM crops c
            WHERE c.id = ?`,
            [cropId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // Calculate progress percentage
        const totalGrowthPeriod = Math.abs(
            Math.floor((new Date(rows[0].expected_harvest_date) - new Date(rows[0].planting_date)) / (1000 * 60 * 60 * 24))
        );
        const progress = Math.min(
            Math.round((rows[0].crop_age_days / totalGrowthPeriod) * 100),
            100
        );

        const cropData = {
            ...rows[0],
            growth_progress: progress,
            growth_stage: getGrowthStage(progress)
        };

        res.status(200).json(cropData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getGrowthStage = (progress) => {
    if (progress < 25) return 'Seedling';
    if (progress < 50) return 'Vegetative';
    if (progress < 75) return 'Flowering';
    if (progress < 90) return 'Fruiting';
    return 'Ready for Harvest';
};

const handleCropChat = async (req, res) => {
    const { message, cropDetails } = req.body;

    try {
        const aiResponse = await generateAITips({
            ...cropDetails,
            question: message
        });
        
        res.json({ reply: aiResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add to exports
module.exports = { 
    addCrop, 
    getCropsByFarmer, 
    getCropById,
    handleCropChat 
};
// Add getCropById to exports
