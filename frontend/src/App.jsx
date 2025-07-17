import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptoList from './components/CryptoList';
import Navbar from './components/NavBar';
import { AuthProvider } from './AuthContext';
import Transactions from './components/Transactions'; 
import Wallet from './components/Wallet';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<CryptoList />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;