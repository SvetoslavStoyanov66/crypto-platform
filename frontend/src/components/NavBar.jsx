import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ConfirmationModal from './ConfirmationModal';
import BuyCryptoModal from './BuyCryptoModal';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, logout, getUser } = useAuth();
  const [showBuyCrypto, setShowBuyCrypto] = useState(false);

  const navigate = useNavigate();
    const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

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
          <button
            onClick={() => setShowBuyCrypto(true)}
            style={styles.button}
            className="nav-button"
          >
            Buy Crypto
          </button>
        </div>
        <div style={styles.rightSection}>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                style={styles.button}
                className="nav-button"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                style={{ ...styles.button, ...styles.registerButton }}
                className="nav-button register-button"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/transactions')}
                style={styles.button}
                className="nav-button"
              >
                Transactions
              </button>
              <button
                onClick={() => navigate('/wallet')}
                style={styles.button}
                className="nav-button"
              >
                My Wallet
              </button>
        <button
          onClick={handleLogoutClick}
          style={styles.button}
          className="nav-button"
        >
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

      {showLogoutConfirm && (
        <ConfirmationModal
          message="Are you sure you want to logout?"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {showBuyCrypto && (
        <BuyCryptoModal onClose={() => setShowBuyCrypto(false)} />
      )}

      <style jsx>{`
        .nav-button {
          transition: all 0.2s ease;
        }
        
        .nav-button:hover {
          font-weight: bold;
          transform: scale(1.05);
        }
        
        .register-button:hover {
          font-weight: bold;
          transform: scale(1.05);
        }
        
        .clickable-logo {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clickable-logo:hover {
          font-weight: bold;
          transform: scale(1.05);
        }
      `}</style>
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
    gap: '1rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    color: "lightgray"
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
  },
  registerButton: {
    backgroundColor: '#4CAF50',
  },
};

export default Navbar;