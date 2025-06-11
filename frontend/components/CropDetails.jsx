import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CropDetails = ({ crop, farmerId, onClose }) => {
    const [cropDetails, setCropDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (crop.id) {
            fetchCropDetails();
        }
    }, [crop.id]);

    const fetchCropDetails = async () => {
        try {
            const response = await axios.get(`https://agriculturebackend-production-c8fd.up.railway.app/api/crops/details/${crop.id}`);
            setCropDetails(response.data);
        } catch (err) {
            console.error('Error fetching crop details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && crop.id) {
        return <div>Loading...</div>;
    }

    return (
        <div className="crop-details-card">
            <h2>{crop.crop_name}</h2>
            
            {cropDetails && (
                <>
                    <div className="growth-info">
                        <h3>Growth Information</h3>
                        <p>Age: {cropDetails.crop_age_days} days</p>
                        <p>Days until harvest: {cropDetails.days_until_harvest}</p>
                        <p>Growth Stage: {cropDetails.growth_stage}</p>
                        
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${cropDetails.growth_progress}%` }}
                            />
                        </div>
                        <p>Progress: {cropDetails.growth_progress}%</p>
                    </div>

                    <div className="farming-tips">
                        <h3>Farming Tips</h3>
                        <div className="tips-content">
                            {cropDetails.tips}
                        </div>
                    </div>
                </>
            )}
            
            <div className="crop-details">
                <p>Planting Date: {new Date(crop.planting_date).toLocaleDateString()}</p>
                <p>Expected Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}</p>
                <p>Soil pH: {crop.soil_ph}</p>
            </div>

            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default CropDetails;