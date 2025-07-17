import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { modalStyles } from './modalStyles';
import { useAuth } from '../AuthContext';

const LoginModal = ({ onClose, showRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      if(response.data.jwt != "") {
          login(response.data.token);
      } else {
          setError(err.response?.data?.message || 'Login failed');
      }
      onClose();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.title}>Login</h2>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        
        {error && <div style={modalStyles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.formGroup}>
            <label htmlFor="username" style={modalStyles.label}>Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={modalStyles.input}
              required
            />
          </div>
          
          <div style={modalStyles.formGroup}>
            <label htmlFor="password" style={modalStyles.label}>Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={modalStyles.input}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...modalStyles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={modalStyles.switchText}>
          Don't have an account?{' '}
          <button 
            onClick={() => {
              onClose();
              showRegister();
            }} 
            style={modalStyles.switchButton}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;