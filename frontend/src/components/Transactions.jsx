import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Spin, Alert, Tag } from 'antd';
import { format } from 'date-fns';
import { CRYPTO_ICONS } from '../assets/cryptoIcons';

const Transactions = () => {
  const { isAuthenticated, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <Alert message="Please login" type="warning" style={styles.alert} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Spin size="large" style={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Alert message={error} type="error" style={styles.alert} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.header}>
            <tr>
              <th style={styles.dateHeader}>Date</th>
              <th style={styles.typeHeader}>Type</th>
              <th style={styles.assetHeader}>Asset</th>
              <th style={styles.amountHeader}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.transactionId} style={styles.row}>
                <td style={styles.dateCell}>
                  {format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm')}
                </td>
                <td style={styles.typeCell}>
                  <Tag color={tx.type === 'BUY' ? 'green' : 'red'}>
                    {tx.type}
                  </Tag>
                </td>
                <td style={styles.assetCell}>
                        <img 
                          src={CRYPTO_ICONS[tx.asset] || CRYPTO_ICONS.DEFAULT} 
                          alt={tx.asset}
                          style={styles.icon}
                          onError={(e) => e.target.src = CRYPTO_ICONS.DEFAULT}
                        />
                        {tx.asset}
                    </td>
                <td style={styles.amountCell}>
                  {parseFloat(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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
  alert: {
    width: '70%',
    marginBottom: '2rem'
  },
  spinner: {
    margin: '2rem 0'
  },
  tableWrapper: { 
    width: '100%', 
    display: 'flex', 
    justifyContent: 'center',
    padding: '0 20px'
  },
  table: {
    width: '70%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: '#f8f9fa'
  },
  dateHeader: { 
    padding: '15px', 
    textAlign: 'left', 
    width: '25%',
    fontWeight: '600'
  },
  typeHeader: { 
    padding: '15px', 
    textAlign: 'left', 
    width: '15%',
    fontWeight: '600'
  },
  assetHeader: { 
    padding: '15px', 
    textAlign: 'left', 
    width: '30%',
    fontWeight: '600'
  },
  amountHeader: { 
    padding: '15px', 
    textAlign: 'right', 
    width: '30%',
    fontWeight: '600'
  },
  row: {
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  dateCell: { 
    padding: '15px'
  },
  typeCell: { 
    padding: '15px'
  },
  assetCell: { 
    padding: '15px',
    lineHeight: '24px'
  },
  amountCell: { 
    padding: '15px',
    textAlign: 'right',
    fontFamily: 'monospace',
    fontSize: '16px' 
  },
  nameWrapper: {
  },
  icon: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }
};

export default Transactions;