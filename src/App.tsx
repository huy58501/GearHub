import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Checkout from './compoments/Checkout.jsx';  // Import Checkout Component
import Products from './components/Products';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  );
};

export default App;
