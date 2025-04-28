import { useState, useEffect } from 'react';
import axios from 'axios';

const ProfitAnalysis = ({ farmerId }) => {
    const [profitData, setProfitData] = useState([]);
    const [newProfit, setNewProfit] = useState({
        crop_id: '',
        cost_of_planting: '',
        sale_price: '',
        yield: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfitData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/profit/${farmerId}`);
                setProfitData(response.data);
            } catch (err) {
                setError('Failed to fetch profit data: ' + err.response?.data?.error || err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfitData();
    }, [farmerId]);

    const handleAddProfit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5000/api/profit/add', newProfit);
            setNewProfit({ crop_id: '', cost_of_planting: '', sale_price: '', yield: '' });
            // Refresh profit data
            const response = await axios.get(`http://localhost:5000/api/profit/${farmerId}`);
            setProfitData(response.data);
        } catch (err) {
            setError('Failed to add profit analysis: ' + err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="profit-analysis">
            <h3>Profit Analysis</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleAddProfit} className="profit-form">
                <input
                    type="number"
                    placeholder="Crop ID"
                    value={newProfit.crop_id}
                    onChange={(e) => setNewProfit({ ...newProfit, crop_id: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Cost of Planting"
                    value={newProfit.cost_of_planting}
                    onChange={(e) => setNewProfit({ ...newProfit, cost_of_planting: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Sale Price"
                    value={newProfit.sale_price}
                    onChange={(e) => setNewProfit({ ...newProfit, sale_price: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Yield"
                    value={newProfit.yield}
                    onChange={(e) => setNewProfit({ ...newProfit, yield: e.target.value })}
                    required
                />
                <button type="submit">Add Record</button>
            </form>

            <h4>Profit Records</h4>
            {isLoading ? (
                <div className="loading-indicator">Loading profit data...</div>
            ) : profitData.length === 0 ? (
                <div className="empty-state">No profit records found. Add your first record above.</div>
            ) : (
                <table className="profit-table">
                    <thead>
                        <tr>
                            <th>Crop Name</th>
                            <th>Cost of Planting</th>
                            <th>Sale Price</th>
                            <th>Yield</th>
                            <th>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profitData.map((profit) => (
                            <tr key={profit.id}>
                                <td>{profit.crop_name}</td>
                                <td>${profit.cost_of_planting}</td>
                                <td>${profit.sale_price}</td>
                                <td>{profit.yield}</td>
                                <td className={profit.profit > 0 ? 'profit-positive' : 'profit-negative'}>
                                    ${profit.profit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProfitAnalysis;