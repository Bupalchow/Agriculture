CREATE TABLE IF NOT EXISTS land_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    land_size DECIMAL(10,2) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    soil_ph DECIMAL(4,2) NOT NULL,
    water_source VARCHAR(100) NOT NULL,
    previous_crop VARCHAR(100),
    organic_farming BOOLEAN DEFAULT 0,
    budget DECIMAL(10,2),
    additional_info TEXT,
    recommendations JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);
