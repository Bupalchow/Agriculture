import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import CropPage from '../components/CropPage';
import Login from '../components/Login';
import Register from '../components/Register';
import { useState } from 'react';
import './components.css';

const App = () => {
    const [farmer, setFarmer] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <BrowserRouter>
            <div className="app-container">
                {!farmer ? (
                    <div className="auth-wrapper">
                        <h1>Agriculture App</h1>
                        <div className="auth-container">
                            {showRegister ? (
                                <Register onRegister={() => setShowRegister(false)} />
                            ) : (
                                <Login onLogin={setFarmer} />
                            )}
                            <div className="auth-switch">
                                <button onClick={() => setShowRegister(!showRegister)}>
                                    {showRegister ? 'Back to Login' : 'Create an Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard farmer={farmer} />} />
                        <Route path="/crop/:cropId" element={<CropPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
};

export default App;