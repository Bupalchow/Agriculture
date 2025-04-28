import React, { useState } from 'react';
import axios from 'axios';

const CROP_DURATIONS = {
    'Rice': 120,
    'Wheat': 150,
    'Corn': 90,
    'Tomatoes': 60,
    'Potatoes': 120,
    'Soybeans': 100,
    'Cotton': 160,
    'Sugarcane': 300,
    'Vegetables': 60,
};

const IRRIGATION_TYPES = [
    'Drip Irrigation',
    'Sprinkler System',
    'Flood Irrigation',
    'Rain-fed',
    'Furrow Irrigation',
    'Center Pivot'
];

const AddCrop = ({ farmerId, onClose, onCropAdded }) => {
    const [cropData, setCropData] = useState({
        crop_name: '',
        variety: '',
        planting_date: '',
        field_size: '',
        soil_ph: '',
        irrigation_type: '',
        previous_crop: '',
        fertilizers_used: '',
        additional_notes: '',
        growth_duration: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCropNameChange = (e) => {
        const selectedCrop = e.target.value;
        setCropData({
            ...cropData,
            crop_name: selectedCrop,
            growth_duration: CROP_DURATIONS[selectedCrop] || 90
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const plantingDate = new Date(cropData.planting_date);
            const expectedHarvestDate = new Date(plantingDate);
            expectedHarvestDate.setDate(plantingDate.getDate() + parseInt(cropData.growth_duration));

            const response = await axios.post('http://localhost:5000/api/crops/add', {
                farmer_id: farmerId,
                ...cropData,
                expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0]
            });
            
            if (response.data.cropId) {
                onCropAdded();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add crop');
        } finally {
            setLoading(false);
        }
    };

    const validateFieldSize = (value) => {
        const size = parseFloat(value);
        if (size <= 0) return 'Field size must be greater than 0';
        if (size > 10000) return 'Field size seems too large';
        return '';
    };

    const validateSoilPH = (value) => {
        const ph = parseFloat(value);
        if (ph < 0 || ph > 14) return 'Soil pH must be between 0 and 14';
        return '';
    };

    return (
        <div className="add-crop-overlay">
            <div className="add-crop-form">
                <h2>Add New Crop</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Crop Type:*</label>
                        <select
                            value={cropData.crop_name}
                            onChange={handleCropNameChange}
                            required
                        >
                            <option value="">Select Crop</option>
                            {Object.keys(CROP_DURATIONS).map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Variety:</label>
                        <input
                            type="text"
                            value={cropData.variety}
                            onChange={(e) => setCropData({...cropData, variety: e.target.value})}
                            placeholder="e.g., Basmati-386, HD-2967"
                        />
                    </div>

                    <div className="form-group">
                        <label>Planting Date:*</label>
                        <input
                            type="date"
                            value={cropData.planting_date}
                            onChange={(e) => setCropData({...cropData, planting_date: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Field Size (acres):*</label>
                        <input
                            type="number"
                            step="0.1"
                            value={cropData.field_size}
                            onChange={(e) => setCropData({...cropData, field_size: e.target.value})}
                            required
                            min="0.1"
                            max="10000"
                        />
                    </div>

                    <div className="form-group">
                        <label>Soil pH:*</label>
                        <input
                            type="number"
                            step="0.1"
                            value={cropData.soil_ph}
                            onChange={(e) => setCropData({...cropData, soil_ph: e.target.value})}
                            required
                            min="0"
                            max="14"
                        />
                    </div>

                    <div className="form-group">
                        <label>Irrigation Type:*</label>
                        <select
                            value={cropData.irrigation_type}
                            onChange={(e) => setCropData({...cropData, irrigation_type: e.target.value})}
                            required
                        >
                            <option value="">Select Irrigation Type</option>
                            {IRRIGATION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Previous Crop:</label>
                        <input
                            type="text"
                            value={cropData.previous_crop}
                            onChange={(e) => setCropData({...cropData, previous_crop: e.target.value})}
                            placeholder="What was grown here before?"
                        />
                    </div>

                    <div className="form-group">
                        <label>Fertilizers Used:</label>
                        <textarea
                            value={cropData.fertilizers_used}
                            onChange={(e) => setCropData({...cropData, fertilizers_used: e.target.value})}
                            placeholder="List fertilizers and quantities used"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Additional Notes:</label>
                        <textarea
                            value={cropData.additional_notes}
                            onChange={(e) => setCropData({...cropData, additional_notes: e.target.value})}
                            placeholder="Any additional information about the crop"
                            rows="3"
                        />
                    </div>

                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? 'Adding...' : 'Add Crop'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCrop;