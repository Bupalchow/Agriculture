import { useState, useEffect } from 'react';
import axios from 'axios';
import CropDetails from './CropDetails';
import ProfitAnalysis from './ProfitAnalysis';
import AddCrop from './AddCrop';
import LandAssessment from './LandAssessment';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ farmer }) => {
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showProfitAnalysis, setShowProfitAnalysis] = useState(false);
    const [showAddCrop, setShowAddCrop] = useState(false);
    const [showLandAssessment, setShowLandAssessment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate();

    const handleCropAdded = async () => {
        // Refresh crops list
        try {
            const response = await axios.get(`https://agriculturebackend-production-c8fd.up.railway.app/api/crops/${farmer.id}`);
            setCrops(response.data);
        } catch (err) {
            alert('Failed to refresh crops: ' + err.message);
        }
    };

    useEffect(() => {
        const fetchCrops = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`https://agriculturebackend-production-c8fd.up.railway.app/api/crops/${farmer.id}`);
                setCrops(response.data);
            } catch (err) {
                alert('Failed to fetch crops: ' + err.response?.data?.error || err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCrops();
    }, [farmer.id]);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Welcome, {farmer.username}</h2>
                <div className="dashboard-actions">
                    <button onClick={() => {
                        setShowLandAssessment(!showLandAssessment);
                        setShowProfitAnalysis(false);
                    }} className={showLandAssessment ? 'active' : ''}>
                        {showLandAssessment ? 'Hide Land Assessment' : 'Land Assessment'}
                    </button>
                    <button onClick={() => setShowAddCrop(true)}>
                        Plant New Crop
                    </button>
                    <button 
                        onClick={() => {
                            setShowProfitAnalysis(!showProfitAnalysis);
                            setShowLandAssessment(false);
                        }}
                        className={showProfitAnalysis ? 'active' : ''}
                    >
                        {showProfitAnalysis ? 'Hide Profit Analysis' : 'Profit Analysis'}
                    </button>
                </div>
            </div>

            {showLandAssessment && <LandAssessment farmerId={farmer.id} />}
            {showProfitAnalysis && <ProfitAnalysis farmerId={farmer.id} />}

            <h3>Your Crops</h3>
            {isLoading ? (
                <div className="loading-indicator">Loading your crops...</div>
            ) : crops.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't planted any crops yet. Start by adding a crop!</p>
                </div>
            ) : (
                <div className="crop-grid">
                    {crops.map((crop) => (
                        <div 
                            key={crop.id} 
                            onClick={() => navigate(`/crop/${crop.id}`)}
                            className="crop-card"
                        >
                            <h3 className="crop-name">{crop.crop_name}</h3>
                            {crop.variety && <p className="crop-variety">Variety: {crop.variety}</p>}
                            
                            <div className="crop-detail">
                                <span>Planted:</span>
                                <span>{new Date(crop.planting_date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="crop-detail">
                                <span>Expected Harvest:</span>
                                <span>{new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="crop-detail">
                                <span>Field Size:</span>
                                <span>{crop.field_size} acres</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddCrop && (
                <AddCrop 
                    farmerId={farmer.id} 
                    onClose={() => setShowAddCrop(false)}
                    onCropAdded={handleCropAdded}
                />
            )}

            {selectedCrop && (
                <CropDetails
                    crop={selectedCrop}
                    farmerId={farmer.id}
                    onClose={() => setSelectedCrop(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;