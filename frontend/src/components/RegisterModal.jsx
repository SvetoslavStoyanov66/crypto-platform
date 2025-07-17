import React, { useState } from 'react';
import axios from 'axios';
import { modalStyles } from './styles/modalStyles';

const RegisterModal = ({ onClose, showLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess('Registration successful! Please login.');
      setTimeout(() => {
        onClose();
        showLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.title}>Register</h2>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        
        {error && <div style={modalStyles.error}>{error}</div>}
        {success && <div style={modalStyles.success}>{success}</div>}
        
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
            <label htmlFor="email" style={modalStyles.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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
          
          <div style={modalStyles.formGroup}>
            <label htmlFor="confirmPassword" style={modalStyles.label}>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={modalStyles.switchText}>
          Already have an account?{' '}
          <button 
            onClick={() => {
              onClose();
              showLogin();
            }} 
            style={modalStyles.switchButton}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;