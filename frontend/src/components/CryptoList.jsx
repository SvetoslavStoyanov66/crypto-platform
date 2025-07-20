import React, { useEffect, useState, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { CRYPTO_ICONS } from '../assets/cryptoIcons';
import { Spin } from 'antd';

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
         <div style={styles.container}>
          <Spin size="large" style={styles.spinner} />
         </div>
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
    marginTop: '7rem',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
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
  icon: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' },
};

export default CryptoList;