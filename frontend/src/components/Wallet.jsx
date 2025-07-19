import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Spin, Alert, Card, Statistic, Table } from 'antd';
import { CRYPTO_ICONS } from '../assets/cryptoIcons';

const Wallet = () => {
  const { isAuthenticated, token } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletAndPrices = async () => {
      try {
        const walletResponse = await fetch('http://localhost:8080/api/wallet', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!walletResponse.ok) throw new Error('Failed to fetch wallet');
        const walletData = await walletResponse.json();
        setWallet(walletData);
        
        if (walletData.crypto) {
          const cryptoAssets = Object.keys(walletData.crypto);
          const pricePromises = cryptoAssets.map(async (asset) => {
            try {
              const response = await fetch(`http://localhost:8080/api/crypto/prices/${asset}`);
              if (!response.ok) return { asset, price: 0 };
              const priceData = await response.json();
              return { asset, price: priceData.lastPrice };
            } catch (err) {
              return { asset, price: 0 };
            }
          });

          const priceResults = await Promise.all(pricePromises);
          const priceMap = priceResults.reduce((acc, { asset, price }) => {
            acc[asset] = price;
            return acc;
          }, {});

          setPrices(priceMap);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchWalletAndPrices();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const columns = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
      render: (asset) => (
        <div style={styles.assetCell}>
          <img 
            src={CRYPTO_ICONS[asset] || CRYPTO_ICONS.DEFAULT} 
            alt={asset}
            style={styles.cryptoIcon}
          />
          <span>{asset}</span>
        </div>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => parseFloat(balance).toFixed(8),
      align: 'right',
    },
    {
      title: 'Price (USD)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
      align: 'right',
    },
    {
      title: 'Value (USD)',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
      align: 'right',
    },
  ];

  if (!isAuthenticated) {
    return <Alert message="Please login to view your wallet" type="warning" style={styles.alert} />;
  }

  if (loading) {
    return <Spin size="large" style={styles.spinner} />;
  }

  if (error) {
    return <Alert message={error} type="error" style={styles.alert} />;
  }

  if (!wallet) {
    return <Alert message="No wallet data found" type="info" style={styles.alert} />;
  }

  const tableData = Object.entries(wallet.crypto || {}).map(([asset, balance]) => {
    const price = prices[asset] || 0;
    const value = balance * price;
    
    return {
      key: asset,
      asset,
      balance: balance.toString(),
      price: price.toString(),
      value: value.toString()
    };
  });

  const totalCryptoValue = tableData.reduce((sum, item) => sum + parseFloat(item.value), 0);
  const totalPortfolioValue = wallet.usdBalance + totalCryptoValue;

  return (
    <div style={styles.container}>
      <div style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Statistic
            title="USD Balance"
            value={wallet.usdBalance}
            precision={2}
            valueStyle={styles.positiveValue}
            prefix="$"
          />
        </Card>
        <Card style={styles.summaryCard}>
          <Statistic
            title="Total Crypto Value"
            value={totalCryptoValue}
            precision={2}
            valueStyle={totalCryptoValue > 0 ? styles.positiveValue : styles.negativeValue}
            prefix="$"
          />
        </Card>
        <Card style={styles.summaryCard}>
          <Statistic
            title="Total Portfolio Value"
            value={totalPortfolioValue}
            precision={2}
            valueStyle={totalPortfolioValue > wallet.usdBalance ? styles.positiveValue : styles.negativeValue}
            prefix="$"
          />
        </Card>
      </div>

      <Table style={styles.table}
        columns={columns}
        dataSource={tableData}
        bordered
        title={() => <h3 style={styles.tableTitle}>Your Cryptocurrency Holdings</h3>}
        pagination={false}
      />
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
  summaryContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  summaryCard: {
    flex: 1,
    minWidth: '200px'
  },
  positiveValue: {
    color: '#3f8600'
  },
  negativeValue: {
    color: '#cf1322'
  },
  assetCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cryptoIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%'
  },
  tableTitle: {
    margin: 0,
    padding: '16px 0'
  },
  table: {
    width: '70%'

  } 
};

export default Wallet;