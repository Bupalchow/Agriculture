import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatInterface from './ChatInterface';


const CropPage = () => {
    const { cropId } = useParams();
    const navigate = useNavigate();
    const [cropDetails, setCropDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCropDetails = async () => {
            try {
                const response = await axios.get(`https://agriculturebackend-production-c8fd.up.railway.app/api/crops/details/${cropId}`);
                setCropDetails(response.data);
            } catch (err) {
                console.error('Error fetching crop details:', err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchCropDetails();
    }, [cropId]);

    if (loading) return <div>Loading...</div>;
    if (!cropDetails) return <div>Crop not found</div>;

    return (
        <div className="crop-page">
            <div className="crop-header">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← Back to Dashboard
                </button>
                <h1>{cropDetails.crop_name}</h1>
                {cropDetails.variety && <h3>Variety: {cropDetails.variety}</h3>}
            </div>

            <div className="crop-info-container">
                <div className="crop-details-section">
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

                    <div className="crop-details">
                        <h3>Cultivation Details</h3>
                        <p>Planting Date: {new Date(cropDetails.planting_date).toLocaleDateString()}</p>
                        <p>Expected Harvest: {new Date(cropDetails.expected_harvest_date).toLocaleDateString()}</p>
                        <p>Field Size: {cropDetails.field_size} acres</p>
                        <p>Soil pH: {cropDetails.soil_ph}</p>
                        <p>Irrigation Type: {cropDetails.irrigation_type}</p>
                    </div>
                </div>

                <div className="chat-section">
                    <h2>Ask AI Assistant</h2>
                    <ChatInterface cropDetails={cropDetails} />
                </div>
            </div>
        </div>
    );
};

export default CropPage;