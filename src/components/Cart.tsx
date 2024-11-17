import React from 'react'; 
import { CartItem } from '../config/Product'; // Import the CartItem type
import { Button } from 'primereact/button'; // Import Button from PrimeReact
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for navigation
import { Dialog } from 'primereact/dialog';
import Navbar from './Navbar';

// Define the props expected by the Cart component
interface CartProps {
    cartItems: any[];
    setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const Cart: React.FC<CartProps> = ({ cartItems, setCartItems, visible, setVisible }) => {
  const navigate = useNavigate(); // Initialize the useNavigate hook to handle navigation

  // Function to update the cart in localStorage whenever items change
  const updateLocalStorage = (updatedItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(updatedItems)); // Store the updated cart items in localStorage
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId: number) => {
    // Filter out the product that matches the productId
    const updatedCartItems = cartItems.filter((item) => item.Id !== productId);
    setCartItems(updatedCartItems); // Update the cart state
    updateLocalStorage(updatedCartItems); // Update the cart in localStorage
  };

  // Function to decrease the quantity of a specific item in the cart
  const decreaseCartItem = (productId: number) => {
    let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]'); // Get cart items from localStorage
    const productToDecrease = cartItems.find(product => product.Id === productId); // Find the product in the cart
    const itemIndex = cartItems.findIndex(item => item.Id === productId); // Get the index of the product

    if (itemIndex >= 0 && productToDecrease) { // Ensure the item exists in the cart
      if (cartItems[itemIndex].qty > 1) { // If the quantity is greater than 1, reduce it by 1
        cartItems[itemIndex].qty -= 1;
        productToDecrease.Qty += 1; // Restore one unit to product quantity in the inventory
      } else {
        // If quantity is 1, remove the item from the cart
        cartItems = cartItems.filter(item => item.Id !== productId);
        productToDecrease.Qty += 1; // Restore one unit to product quantity in the inventory
      }

      // Update localStorage and the cart state
      localStorage.setItem('cart', JSON.stringify(cartItems));
      setCartItems(cartItems);
    }
  };

  // Function to increase the quantity of a specific item in the cart
  const increaseCartItem = (productId: number) => {
    let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]'); // Get cart items from localStorage
    const productToIncrease = cartItems.find(product => product.Id === productId); // Find the product in the cart
    const itemIndex = cartItems.findIndex(item => item.Id === productId); // Get the index of the product

    if (itemIndex >= 0 && productToIncrease && productToIncrease.Qty > 0) { // Ensure there is stock available
      cartItems[itemIndex].qty += 1; // Increase the cart item quantity
      productToIncrease.Qty -= 1; // Decrease the available stock of the product

      // Update localStorage and the cart state
      localStorage.setItem('cart', JSON.stringify(cartItems));
      setCartItems(cartItems);
    } else {
      console.error("Cannot increase item: Out of stock or not found"); // Log error if item is out of stock
    }
  };

  // Function to handle redirection to the checkout page
  const handleGoToCheckout = () => {
    navigate('/checkout'); // Redirect to the '/checkout' page
  };
  // Toggle the visibility of the cart dialog when the cart icon is clicked
  const handleCartIconClick = () => {
    setVisible(!visible); // Toggle visibility state of the cart dialog
  };  
  return (
    <><Navbar cartCount={cartItems.length} onCartIconClick={handleCartIconClick} />
    <Dialog header="Item Added to Cart" visible={visible} onHide={() => setVisible(false)} style={{ width: '860px', height: 'auto' }}>
          <div style={{ padding: '20px' }}>
              {/* Check if there are items in the cart */}
              {cartItems.length > 0 ? (
                  <div className="cart-items-list">
                      {/* Loop through all cart items and display them */}
                      {cartItems.map((item, index) => (
                          <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                              {/* Display item image */}
                              <img src={item.Photo} alt={item.Name} style={{ width: '92px', height: '92px', margin: '10px' }} />

                              <div style={{ flex: 1 }}>
                                  <p style={{ margin: '0 0 0 20px', fontWeight: 'bold' }}>{item.Name}</p> {/* Display item name */}
                              </div>

                              {/* Display buttons to decrease or increase the quantity */}
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid gray' }}>
                                  <button
                                      style={{ marginRight: '5px', padding: '5px', cursor: 'pointer', backgroundColor: 'white', border: 'none' }}
                                      onClick={() => decreaseCartItem(item.Id)} // Call decrease function on click
                                  >
                                      -
                                  </button>
                                  <span style={{ margin: '0 10px' }}>{item.qty}</span> {/* Display current quantity */}
                                  <button
                                      style={{ marginLeft: '5px', padding: '5px', cursor: 'pointer', backgroundColor: 'white', border: 'none' }}
                                      onClick={() => increaseCartItem(item.Id)} // Call increase function on click
                                  >
                                      +
                                  </button>
                              </div>

                              {/* Display remove button to remove the item from the cart */}
                              <div style={{ marginLeft: '20px' }}>
                                  <Button label="Remove" className="p-button-text" onClick={() => removeFromCart(item.Id)} />
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p>No items in the cart.</p> // Message if cart is empty
              )}

              {/* Display the "Go to Checkout" button */}
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <Button style={{ backgroundColor: '#D54300', color: 'white', marginRight : '10px' }} label="Cancel" onClick={() => setVisible(false)} className="p-button-text" />
                  <Button style={{ backgroundColor: '#D54300', color: 'white'}} label="Go to Checkout" onClick={handleGoToCheckout} className="p-button-text" />
              </div>
          </div>
      </Dialog></>
    
  );
};

export default Cart;
