import React from 'react';
import { Route, Routes } from 'react-router-dom';
// @ts-ignore
import Checkout from './components/Checkout'; // Import Checkout Component
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
