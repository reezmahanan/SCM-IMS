import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role || 'USER');
      navigate('/');
    } catch (err) {
      // Handle different error response formats
      let errorMsg = 'Login failed';
      
      if (err.response?.data) {
        // If response.data is a string (plain text error message)
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
        // If response.data is an object with a message property
        else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
        // If response.data is an object with an error property
        else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
