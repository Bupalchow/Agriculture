const db = require('../config/db');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { username, password, location } = req.body;

    // Validate input
    if (!username || !password || !location) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if the username already exists
        const [existingFarmer] = await db.query('SELECT * FROM farmers WHERE username = ?', [username]);
        if (existingFarmer.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new farmer into the database
        const [result] = await db.query(
            'INSERT INTO farmers (username, password, location) VALUES (?, ?, ?)',
            [username, hashedPassword, location]
        );

        res.status(201).json({ message: 'Farmer registered successfully', farmerId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM farmers WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', farmer: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };