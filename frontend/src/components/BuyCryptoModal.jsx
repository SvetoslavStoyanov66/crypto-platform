import React, { useState, useEffect } from 'react';
import { CRYPTO_ICONS } from '../assets/cryptoIcons';
import { useAuth } from '../AuthContext';

const DEFAULT_CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'BTC', icon: CRYPTO_ICONS.BTC },
  { value: 'ETH', label: 'ETH', icon: CRYPTO_ICONS.ETH },
  { value: 'SOL', label: 'SOL', icon: CRYPTO_ICONS.SOL },
  { value: 'ADA', label: 'ADA', icon: CRYPTO_ICONS.ADA },
];

const DEFAULT_CRYPTO_PRICES = {
  ETH: 3000,
  SOL: 100,
  ADA: 0.5,
};

const BuyCryptoModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState(DEFAULT_CRYPTO_OPTIONS);
  const [cryptoPrices, setCryptoPrices] = useState(DEFAULT_CRYPTO_PRICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8080/api/crypto/prices');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response format');
        }

        const options = data.map(crypto => {
          const symbol = crypto.symbol ? crypto.symbol.split('/')[0].trim().toUpperCase() : 'UNKNOWN';
          
          return {
            value: symbol,
            label: symbol,
            icon: symbol in CRYPTO_ICONS ? CRYPTO_ICONS[symbol] : CRYPTO_ICONS.DEFAULT
          };
        });
        
        const prices = {};
        data.forEach(crypto => {
          if (crypto.symbol && crypto.lastPrice) {
            const symbol = crypto.symbol.split('/')[0].trim().toUpperCase();
            
            let priceValue;
            if (typeof crypto.lastPrice === 'string') {
              const trimmedPrice = crypto.lastPrice.trim();
              priceValue = parseFloat(trimmedPrice);
              
              if (isNaN(priceValue)) {
                console.warn(`Invalid price for ${symbol}: ${crypto.lastPrice}`);
                return;
              }
            } else if (typeof crypto.lastPrice === 'number') {
              priceValue = crypto.lastPrice;
            } else {
              console.warn(`Invalid price type for ${symbol}: ${typeof crypto.lastPrice}`);
              return;
            }
            
            if (priceValue <= 0) {
              console.warn(`Invalid price (non-positive) for ${symbol}: ${priceValue}`);
              return;
            }
            
            prices[symbol] = priceValue;
          }
        });
        
        setCryptoOptions(options.length ? options : DEFAULT_CRYPTO_OPTIONS);
        setCryptoPrices(prev => ({ ...DEFAULT_CRYPTO_PRICES, ...prices }));
      } catch (err) {
        console.error('Failed to fetch crypto data:', err);
        setError(err.message);
        setCryptoOptions(DEFAULT_CRYPTO_OPTIONS);
        setCryptoPrices(DEFAULT_CRYPTO_PRICES);
      } finally {
        setLoading(false);
      }
    };
    fetchCryptoData();
  }, []);

  useEffect(() => {
    setCryptoAmount('');
    setUsdAmount('');
  }, [selectedCrypto]);

  const validateAmount = () => {
    if (!cryptoAmount || isNaN(parseFloat(cryptoAmount))) {
      setError('Please enter a valid amount');
      return false;
    }
    if (parseFloat(cryptoAmount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    return true;
  };

 const handleBuy = async () => {
  if (!validateAmount()) return;
  
  try {
    setLoading(true);
    const response = await fetch('http://localhost:8080/api/trade/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cryptoName: selectedCrypto,
        amount: parseFloat(cryptoAmount)
      }),
    });

    if (!response.ok) {
      let errorMsg = `Buy failed with status ${response.status}`;
      try {
        const errorResponse = await response.text();
        if (errorResponse) {
          errorMsg += ` - ${errorResponse}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      throw new Error(errorMsg);
    }

    const responseText = await response.text();
    if (!responseText) {
      alert(`Successfully bought ${cryptoAmount} ${selectedCrypto}`);
      onClose();
      return;
    }

    try {
      const result = JSON.parse(responseText);
      alert(`Successfully bought ${cryptoAmount} ${selectedCrypto}`);
      onClose();
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      alert(`Trade completed but received unexpected response`);
      onClose();
    }

  } catch (err) {
    console.error('Buy failed:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

const handleSell = async () => {
  if (!validateAmount()) return;
  
  try {
    setLoading(true);
    const response = await fetch('http://localhost:8080/api/trade/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cryptoName: selectedCrypto,
        amount: parseFloat(cryptoAmount)
      }),
    });

    if (!response.ok) {
      let errorMsg = `Sell failed with status ${response.status}`;
      try {
        const errorResponse = await response.text();
        if (errorResponse) {
          errorMsg += ` - ${errorResponse}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      throw new Error(errorMsg);
    }

    const responseText = await response.text();
    if (!responseText) {
      alert(`Successfully sold ${cryptoAmount} ${selectedCrypto}`);
      onClose();
      return;
    }

    try {
      const result = JSON.parse(responseText);
      alert(`Successfully sold ${cryptoAmount} ${selectedCrypto}`);
      onClose();
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      alert(`Trade completed but received unexpected response`);
      onClose();
    }

  } catch (err) {
    console.error('Sell failed:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleCryptoAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setCryptoAmount(value);
      if (value && cryptoPrices[selectedCrypto]) {
        const usdValue = parseFloat(value) * cryptoPrices[selectedCrypto];
        setUsdAmount(usdValue.toFixed(2));
      } else {
        setUsdAmount('');
      }
    }
  };

  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setUsdAmount(value);
      if (value && cryptoPrices[selectedCrypto]) {
        const cryptoValue = parseFloat(value) / cryptoPrices[selectedCrypto];
        setCryptoAmount(cryptoValue.toFixed(8).replace(/\.?0+$/, ''));
      } else {
        setCryptoAmount('');
      }
    }
  };

  const selectCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setShowCryptoDropdown(false);
  };

  const selectedCryptoData = cryptoOptions.find(opt => opt.value === selectedCrypto) || 
                          DEFAULT_CRYPTO_OPTIONS.find(opt => opt.value === 'ETH');

  if (loading) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>Processing your trade...</div>
            <div style={{ 
              display: 'inline-block', 
              width: '50px', 
              height: '50px', 
              border: '3px solid rgba(0,0,0,.1)', 
              borderLeftColor: '#1a237e', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            Error: {error}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                onClick={onClose}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1a237e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button 
                onClick={() => setError(null)}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#7e6f1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Trade Crypto</h2>
          <button onClick={onClose} style={modalStyles.closeButton}>×</button>
        </div>

        <div style={modalStyles.tabs}>
          <button
            style={{
              ...modalStyles.tabButton,
              ...(activeTab === 'buy' ? modalStyles.activeTab : {})
            }}
            onClick={() => setActiveTab('buy')}
          >
            Buy
          </button>
          <button
            style={{
              ...modalStyles.tabButton,
              ...(activeTab === 'sell' ? modalStyles.activeTab : {})
            }}
            onClick={() => setActiveTab('sell')}
          >
            Sell
          </button>
        </div>
        
        {activeTab === 'buy' ? (
          <div style={modalStyles.inputContainer}>
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.inputLabel}>You pay</label>
              <div style={modalStyles.inputWrapper}>
                <input
                  type="text"
                  value={usdAmount}
                  onChange={handleUsdAmountChange}
                  placeholder="0.00"
                  style={modalStyles.input}
                />
                <div style={modalStyles.currencyLabel}>USD</div>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.inputLabel}>You get</label>
              <div style={modalStyles.inputWrapper}>
                <input
                  type="text"
                  value={cryptoAmount}
                  onChange={handleCryptoAmountChange}
                  placeholder="0.00"
                  style={{...modalStyles.input, color: '#666'}}
                />
                <div 
                  style={modalStyles.cryptoSelector}
                  onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                >
                  <img 
                    src={selectedCryptoData.icon} 
                    alt={selectedCrypto} 
                    style={modalStyles.cryptoIcon} 
                  />
                  {selectedCrypto}
                  <span style={modalStyles.dropdownArrow}>▾</span>
                </div>
                {showCryptoDropdown && (
                  <div style={modalStyles.dropdown}>
                    {cryptoOptions.map((option) => (
                      <div
                        key={option.value}
                        style={modalStyles.dropdownItem}
                        onClick={() => selectCrypto(option.value)}
                      >
                        <img 
                          src={option.icon} 
                          alt={option.label} 
                          style={modalStyles.cryptoIcon} 
                        />
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleBuy}
              style={modalStyles.confirmButton}
              disabled={!cryptoAmount || loading}
            >
              {loading ? 'Processing...' : `Buy ${selectedCrypto}`}
            </button>
          </div>
        ) : (
          <div style={modalStyles.inputContainer}>
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.inputLabel}>You sell</label>
              <div style={modalStyles.inputWrapper}>
                <input
                  type="text"
                  value={cryptoAmount}
                  onChange={handleCryptoAmountChange}
                  placeholder="0.00"
                  style={modalStyles.input}
                />
                <div 
                  style={modalStyles.cryptoSelector}
                  onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                >
                  <img 
                    src={selectedCryptoData.icon} 
                    alt={selectedCrypto} 
                    style={modalStyles.cryptoIcon} 
                  />
                  {selectedCrypto}
                  <span style={modalStyles.dropdownArrow}>▾</span>
                </div>
                {showCryptoDropdown && (
                  <div style={modalStyles.dropdown}>
                    {cryptoOptions.map((option) => (
                      <div
                        key={option.value}
                        style={modalStyles.dropdownItem}
                        onClick={() => selectCrypto(option.value)}
                      >
                        <img 
                          src={option.icon} 
                          alt={option.label} 
                          style={modalStyles.cryptoIcon} 
                        />
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.inputLabel}>You receive</label>
              <div style={modalStyles.inputWrapper}>
                <input
                  type="text"
                  value={usdAmount}
                  onChange={handleUsdAmountChange}
                  placeholder="0.00"
                  style={{...modalStyles.input, color: '#666'}}
                />
                <div style={modalStyles.currencyLabel}>USD</div>
              </div>
            </div>

            <button 
              onClick={handleSell}
              style={{
                ...modalStyles.confirmButton,
                backgroundColor: '#7e6f1a',
                '&:hover': {
                  backgroundColor: '#030101ff',
                },
              }}
              disabled={!cryptoAmount || loading}
            >
              {loading ? 'Processing...' : `Sell ${selectedCrypto}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    width: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    color: '#999',
    padding: '0 0.5rem',
    lineHeight: '1',
    '&:hover': {
      color: '#666',
    },
  },
  tabs: {
    display: 'flex',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e0e0e0',
  },
  tabButton: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#1a237e',
    fontWeight: '600',
    borderBottom: '2px solid #1a237e',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBottom: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'border-color 0.2s',
    '&:focusWithin': {
      borderColor: '#1a237e',
    },
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1.2rem',
    padding: '0.25rem',
    backgroundColor: 'transparent',
  },
  cryptoSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  cryptoIcon: {
    width: '20px',
    height: '20px',
    objectFit: 'contain',
  },
  dropdownArrow: {
    fontSize: '0.7rem',
    color: '#666',
    marginLeft: '0.25rem',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    width: '140px',
    overflow: 'hidden',
    marginTop: '0.5rem',
    maxHeight: '200px', 
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
     whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  currencyLabel: {
    padding: '0.5rem 1rem',
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#1a237e',
    color: 'white',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#0d1545',
    },
    '&:disabled': {
      backgroundColor: '#e0e0e0',
      color: '#aaa',
      cursor: 'not-allowed',
    },
  },
};

export default BuyCryptoModal;