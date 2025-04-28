import { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            await axios.post('http://localhost:5000/api/farmers/register', {
                username,
                password,
                location,
            });
            alert('Registration successful! Please login.');
            onRegister(); // Switch to login after registration
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Create Account</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default Register;