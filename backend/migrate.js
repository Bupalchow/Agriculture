const db = require('./config/db');

const createTables = async () => {
    try {
        console.log('🚀 Starting database migration...');

        // Create farmers table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS farmers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Farmers table created');

        // Create crops table  
        await db.execute(`
            CREATE TABLE IF NOT EXISTS crops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                farmer_id INT NOT NULL,
                crop_name VARCHAR(255) NOT NULL,
                planting_date DATE NOT NULL,
                expected_harvest_date DATE NOT NULL,
                soil_ph DECIMAL(3,1),
                variety VARCHAR(255),
                field_size DECIMAL(10,2),
                irrigation_type VARCHAR(100),
                previous_crop VARCHAR(255),
                fertilizers_used TEXT,
                additional_notes TEXT,
                tips TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Crops table created');

        // Create land_assessments table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS land_assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                farmer_id INT NOT NULL,
                location VARCHAR(255) NOT NULL,
                land_size DECIMAL(10,2) NOT NULL,
                soil_type VARCHAR(100) NOT NULL,
                soil_ph DECIMAL(3,1),
                water_source VARCHAR(100),
                previous_crop VARCHAR(255),
                organic_farming BOOLEAN DEFAULT FALSE,
                budget DECIMAL(10,2),
                additional_info TEXT,
                recommendations JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Land assessments table created');

        // Create profit_analysis table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS profit_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                crop_id INT NOT NULL,
                cost_of_planting DECIMAL(10,2) NOT NULL,
                sale_price DECIMAL(10,2) NOT NULL,
                yield DECIMAL(10,2) NOT NULL,
                profit DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Profit analysis table created');

        console.log('🎉 All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();