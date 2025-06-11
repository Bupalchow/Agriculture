const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Load from root directory
const db = require('./config/db');
const farmerRoutes = require('./routes/farmerRoutes');
const cropRoutes = require('./routes/cropRoutes');
const profitRoutes = require('./routes/profitRoutes');
const landAssessmentRoutes = require('./routes/landAssessmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/', (req, res) => {
    res.json({ message: 'Agriculture API is running!' });
});

// Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/land-assessment', landAssessmentRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});