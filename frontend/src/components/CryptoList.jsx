import React, { useEffect, useState, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';

const CRYPTO_ICONS = {
  XBT: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  BCH: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  ETC: 'https://assets.coingecko.com/coins/images/453/large/ethereum-classic.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  XLM: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
  FIL: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
  ICP: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
  EOS: 'https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  // Fallback
  DEFAULT: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
};

const AnimatedValue = ({ value, isPositive }) => {
  const props = useSpring({
    from: { 
      opacity: 0,
      transform: `translateY(${isPositive ? '-10px' : '10px'})`,
      color: isPositive ? '#4CAF50' : '#F44336'
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px)',
      color: isPositive ? '#4CAF50' : '#F44336'
    },
    config: { tension: 300, friction: 20 }
  });

  return <animated.div style={props}>{value}</animated.div>;
};

function CryptoList() {
  const [prices, setPrices] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const buffer = useRef([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/crypto/prices/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        buffer.current = data;
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse SSE data', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error', err);
      eventSource.close();
    };

    const intervalId = setInterval(() => {
      if (buffer.current.length > 0) {
        setPreviousPrices(prices.reduce((acc, crypto) => ({
          ...acc,
          [crypto.symbol]: { 
            lastPrice: crypto.lastPrice,
            change: crypto.change
          }
        }), {}));

        setPrices(buffer.current);
        buffer.current = [];
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
      eventSource.close();
    };
  }, [prices]); 

  const getPriceChangeDirection = (symbol, currentPrice) => {
    if (!previousPrices[symbol]) return 'neutral';
    return currentPrice > previousPrices[symbol].lastPrice ? 'up' : 'down';
  };

  const getChangeDirection = (symbol, currentChange) => {
    if (!previousPrices[symbol]) return 'neutral';
    return currentChange > previousPrices[symbol].change ? 'up' : 'down';
  };

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={styles.loading}>Loading prices...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.header}>
              <tr>
                <th style={styles.nameHeader}>Name</th>
                <th style={styles.priceHeader}>Last Price</th>
                <th style={styles.changeHeader}>24H Change</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((crypto) => {
                const symbol = crypto.symbol.split('/')[0];
                const priceDirection = getPriceChangeDirection(crypto.symbol, crypto.lastPrice);
                const changeDirection = getChangeDirection(crypto.symbol, crypto.change);
                const isPositiveChange = crypto.change >= 0;

                return (
                  <tr key={crypto.symbol} style={styles.row}>
                    <td style={styles.nameCell}>
                      <div style={styles.nameWrapper}>
                        <img 
                          src={CRYPTO_ICONS[symbol] || CRYPTO_ICONS.DEFAULT} 
                          alt={symbol}
                          style={styles.icon}
                          onError={(e) => e.target.src = CRYPTO_ICONS.DEFAULT}
                        />
                        {symbol}
                      </div>
                    </td>
                    <td style={styles.priceCell}>
                      <AnimatedValue 
                        value={`$${crypto.lastPrice.toFixed(2)}`} 
                        isPositive={priceDirection === 'up'}
                      />
                    </td>
                    <td style={styles.changeCell}>
                      <AnimatedValue 
                        value={`${crypto.change?.toFixed(2) || '0.00'}%`} 
                        isPositive={isPositiveChange}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: '2rem',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loading: { textAlign: 'center' },
  tableWrapper: { width: '100%', display: 'flex', justifyContent: 'center' },
  table: {
    width: '70%',
    borderCollapse: 'collapse',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    backgroundColor: 'white',
    overflow: 'hidden',
    tableLayout: 'fixed',
  },
  header: {
    background: 'linear-gradient(180deg, white, lightgray)',
    color: 'black',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  nameHeader: { padding: '12px 15px', textAlign: 'left', width: '70%' },
  priceHeader: { padding: '12px 15px', textAlign: 'right', width: '15%', paddingRight: '40px' },
  changeHeader: { padding: '12px 15px', textAlign: 'right', width: '15%' },
  row: {
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f5f5f5',
      transform: 'scale(1.01)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }
  },
  nameCell: { padding: '10px 15px', borderBottom: '1px solid #eee', textAlign: 'left' },
  priceCell: { padding: '10px 15px', textAlign: 'right', borderBottom: '1px solid #eee', paddingRight: '40px' },
  changeCell: { padding: '10px 15px', textAlign: 'right', borderBottom: '1px solid #eee' },
  nameWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
  icon: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }
};

export default CryptoList;