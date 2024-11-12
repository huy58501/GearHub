import React from 'react';
import { FaUser } from 'react-icons/fa';

interface NavbarProps {
  cartCount: number;
  onCartIconClick: () => void; // Add prop for handling the cart icon click
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartIconClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left-placeholder" />
      <div className="navbar-center">
        <div className="navbar-brand-img">
          <a href="/home">
            <img 
              src="/img/logo.png" 
              alt="Brand Logo" 
              className="brand-logo"
            />
          </a>
        </div>
        <div className="navbar-brand-name">
          <b>GEAR HUB</b>
        </div>
      </div>
      <div className="navbar-icons">
        <button className="cart-icon" onClick={onCartIconClick}>
          <i className="pi pi-shopping-cart" style={{ color: '#708090', fontSize: '1.5rem' }}>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </i>
        </button>
        <a href="/login">
          <FaUser />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
