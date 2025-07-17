import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated, logout, getUser} = useAuth();
  const navigate = useNavigate();


  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.leftSection}>
          <span 
            style={styles.logo} 
            onClick={() => navigate('/')}  
            className="clickable-logo"  
          >
            Crypto-Platform
          </span>
        </div>
        <div style={styles.rightSection}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => setShowLogin(true)} style={styles.button}>
                Login
              </button>
              <button 
                onClick={() => setShowRegister(true)} 
                style={{ ...styles.button, ...styles.registerButton }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/transactions')} 
                style={styles.button}
              >
                Transactions
              </button>
            <button 
                onClick={() => navigate('/wallet')} 
                style={styles.button}
              >
              My Wallet
            </button>
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
           </>
          )}
        </div>
      </nav>

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          showRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)}
          showLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a237e',
    color: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  rightSection: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    ':hover': {
      backgroundColor: '#3e8e41',
    },
  },
};

export default Navbar;