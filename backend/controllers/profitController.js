const db = require('../config/db');

const addProfitAnalysis = async (req, res) => {
    const { crop_id, cost_of_planting, sale_price, yield } = req.body;

    if (!crop_id || !cost_of_planting || !sale_price || !yield) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Validate that the crop exists
        const [crop] = await db.query('SELECT * FROM crops WHERE id = ?', [crop_id]);
        if (crop.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // Calculate profit
        const profit = (sale_price * yield) - cost_of_planting;

        const [result] = await db.query(
            'INSERT INTO profit_analysis (crop_id, cost_of_planting, sale_price, yield, profit) VALUES (?, ?, ?, ?, ?)',
            [crop_id, cost_of_planting, sale_price, yield, profit]
        );
        res.status(201).json({ message: 'Profit analysis added successfully', profitId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProfitAnalysisByFarmer = async (req, res) => {
    const { farmerId } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT pa.*, c.crop_name 
             FROM profit_analysis pa
             JOIN crops c ON pa.crop_id = c.id
             WHERE c.farmer_id = ?`,
            [farmerId]
        );
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addProfitAnalysis, getProfitAnalysisByFarmer };