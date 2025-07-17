import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CryptoList from './components/CryptoList';
import Navbar from './components/NavBar';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <CryptoList />
      </AuthProvider>
    </Router>
  );
}

export default App;