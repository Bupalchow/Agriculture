import { useState, useEffect } from 'react';
import axios from 'axios';

const LandAssessment = ({ farmerId }) => {
    const [formData, setFormData] = useState({
        location: '',
        landSize: '',
        soilType: '',
        soilPh: '',
        waterSource: '',
        previousCrop: '',
        organicFarming: false,
        budget: '',
        additionalInfo: ''
    });
    
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedAssessments, setSavedAssessments] = useState([]);
    const [showSavedList, setShowSavedList] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const soilTypes = [
        'Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 
        'Chalky', 'Clayey Loam', 'Sandy Loam', 'Black Cotton'
    ];

    const waterSources = [
        'Well', 'Borewell', 'Canal', 'River', 'Rainwater', 
        'Municipal', 'Tanker', 'Irrigation System'
    ];

    useEffect(() => {
        // Fetch saved assessments when component mounts
        fetchSavedAssessments();
    }, [farmerId]);

    const fetchSavedAssessments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/land-assessment/${farmerId}`);
            setSavedAssessments(response.data);
        } catch (err) {
            console.error('Failed to fetch saved assessments:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/land-assessment', {
                farmerId,
                ...formData
            });
            
            setRecommendations(response.data);
            
            // Save the assessment (backend will handle this, but we'll refresh our list)
            fetchSavedAssessments();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get recommendations');
            console.error('Land assessment error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAssessment = async (assessmentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/land-assessment/details/${assessmentId}`);
            setSelectedAssessment(response.data);
            setShowSavedList(false);
        } catch (err) {
            console.error('Failed to fetch assessment details:', err);
        }
    };

    const handleSaveAssessment = async () => {
        if (!recommendations) return;
        
        try {
            await axios.post('http://localhost:5000/api/land-assessment/save', {
                farmerId,
                landDetails: formData,
                recommendations
            });
            
            // Refresh the list of saved assessments
            fetchSavedAssessments();
            alert('Assessment saved successfully!');
        } catch (err) {
            console.error('Failed to save assessment:', err);
            alert('Failed to save the assessment.');
        }
    };

    const formatRecommendations = (data) => {
        if (!data) return null;
        
        return (
            <div className="recommendations-display">
                <h3>Recommended Crops</h3>
                <div className="crop-recommendations">
                    {data.recommendedCrops.map((crop, index) => (
                        <div key={index} className="recommended-crop-card">
                            <h4>{crop.name}</h4>
                            <p><strong>Ideal planting time:</strong> {crop.plantingTime}</p>
                            <p><strong>Expected yield:</strong> {crop.expectedYield}</p>
                            <p><strong>Profit potential:</strong> {crop.profitPotential}</p>
                            <div className="crop-tips">
                                <h5>Growing Tips:</h5>
                                <ul>
                                    {crop.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="weather-forecast">
                    <h3>Weather Forecast for Your Region</h3>
                    <p>{data.weatherSummary}</p>
                    <div className="seasonal-forecasts">
                        {data.seasonalForecasts.map((season, index) => (
                            <div key={index} className="season-card">
                                <h4>{season.name}</h4>
                                <p>{season.forecast}</p>
                                <p><strong>Best crops:</strong> {season.suitableCrops.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="efficiency-improvements">
                    <h3>Efficiency Improvement Suggestions</h3>
                    <ul>
                        {data.efficiencyTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                </div>
                
                <div className="action-buttons">
                    {!selectedAssessment && (
                        <button 
                            onClick={handleSaveAssessment} 
                            className="save-button"
                        >
                            Save This Assessment
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setRecommendations(null);
                            setSelectedAssessment(null);
                        }} 
                        className="back-button"
                    >
                        New Assessment
                    </button>
                </div>
            </div>
        );
    };

    const renderSavedAssessments = () => {
        return (
            <div className="saved-assessments">
                <h3>Your Saved Land Assessments</h3>
                {savedAssessments.length === 0 ? (
                    <p className="empty-state">You don't have any saved land assessments yet.</p>
                ) : (
                    <div className="assessment-list">
                        {savedAssessments.map((assessment) => (
                            <div key={assessment.id} className="assessment-item" onClick={() => handleViewAssessment(assessment.id)}>
                                <h4>{assessment.location}</h4>
                                <p>Soil Type: {assessment.soilType}</p>
                                <p>Land Size: {assessment.landSize} acres</p>
                                <p>Date: {new Date(assessment.createdAt).toLocaleDateString()}</p>
                                <button className="view-button">View Details</button>
                            </div>
                        ))}
                    </div>
                )}
                <button 
                    className="back-button" 
                    onClick={() => setShowSavedList(false)}
                >
                    Back to Assessment Form
                </button>
            </div>
        );
    };

    return (
        <div className="land-assessment-container">
            <div className="assessment-header">
                <h2>Land Assessment & Crop Recommendations</h2>
                <div className="view-toggle">
                    <button 
                        className={!showSavedList ? 'active' : ''} 
                        onClick={() => setShowSavedList(false)}
                    >
                        New Assessment
                    </button>
                    <button 
                        className={showSavedList ? 'active' : ''} 
                        onClick={() => {
                            setShowSavedList(true);
                            setRecommendations(null);
                            setSelectedAssessment(null);
                        }}
                    >
                        Saved Assessments ({savedAssessments.length})
                    </button>
                </div>
            </div>
            
            {showSavedList ? renderSavedAssessments() : (
                <>
                    {!recommendations && !selectedAssessment && (
                        <>
                            <p className="feature-description">
                                Enter your land details below to receive AI-powered recommendations for optimal crops,
                                planting schedules, and efficiency tips based on your specific conditions and local weather forecasts.
                            </p>
                            
                            {error && <div className="error-message">{error}</div>}
                            
                            <form onSubmit={handleSubmit} className="land-assessment-form">
                                <div className="form-group">
                                    <label>Location (City, State):*</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Bangalore, Karnataka"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Land Size (acres):*</label>
                                    <input
                                        type="number"
                                        name="landSize"
                                        value={formData.landSize}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 5"
                                        min="0.1"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Soil Type:*</label>
                                    <select
                                        name="soilType"
                                        value={formData.soilType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Soil Type</option>
                                        {soilTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Soil pH:*</label>
                                    <input
                                        type="number"
                                        name="soilPh"
                                        value={formData.soilPh}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 6.5"
                                        min="0"
                                        max="14"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Water Source:*</label>
                                    <select
                                        name="waterSource"
                                        value={formData.waterSource}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Water Source</option>
                                        {waterSources.map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Previous Crop:</label>
                                    <input
                                        type="text"
                                        name="previousCrop"
                                        value={formData.previousCrop}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Rice, Cotton"
                                    />
                                </div>
                                
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="organicFarming"
                                            checked={formData.organicFarming}
                                            onChange={handleInputChange}
                                        />
                                        Interested in Organic Farming
                                    </label>
                                </div>
                                
                                <div className="form-group">
                                    <label>Budget (per acre in INR):</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 50000"
                                        min="1000"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Additional Information:</label>
                                    <textarea
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                        placeholder="Any other details about your land or requirements"
                                        rows="3"
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Analyzing...' : 'Get Recommendations'}
                                </button>
                            </form>
                        </>
                    )}
                    
                    {recommendations && formatRecommendations(recommendations)}
                    {selectedAssessment && formatRecommendations(selectedAssessment.recommendations)}
                </>
            )}
        </div>
    );
};

export default LandAssessment;
