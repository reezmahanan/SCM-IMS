import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess, onToggleRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password
      });

      if (res.data.success) {
        onLoginSuccess(res.data.token, res.data.username, res.data.role);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Sign In</h2>
        <p>Access your SCM Inventory Management System</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <button className="btn-link" onClick={onToggleRegister}>Sign Up</button></p>
      </div>
    </div>
  );
}

export default Login;
