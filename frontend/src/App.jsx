import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptoList from './components/CryptoList';
import Navbar from './components/NavBar';
import { AuthProvider } from './AuthContext';
import Transactions from './components/Transactions'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<CryptoList />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;