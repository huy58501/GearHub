import React, { useEffect, useState } from "react";
import axios from "axios";
import { CartItem, Product } from "../config/Product"; // Import the Product interface
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { ProgressSpinner } from 'primereact/progressspinner';

interface Category {
    name: string;
    key: string;
}

const Products: React.FC = () => {
    const navigate = useNavigate(); // Hook to handle navigation
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [cartCount, setCartCount] = useState<number>(0); // State for cart count
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Increment cart count when adding to cart, add item into local storage
    const handleAddToCart = (productId: number) => {
        setVisible(true);
        let newQty = 0;
    
        // Extend the Product type to include qty
        type CartItem = Product & { qty: number };
    
        // Retrieve existing cart data from local storage
        let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    
        // Find the product by its ID
        const existingProductIndex = cartItems.findIndex(item => item.Id === productId);
        const productToAdd = products.find(product => product.Id === productId);
    
        if (existingProductIndex >= 0 && productToAdd) {
            // If the product is already in the cart, update its qty
            cartItems[existingProductIndex].qty += 1;
            newQty = productToAdd.Qty -= 1; // Update the original product's Qty
            productToAdd.Qty = newQty;
        } else {
            // If the product is not in the cart, add it with a quantity of 1
            if (productToAdd) {
                newQty = productToAdd.Qty -= 1; // Update the original product's Qty
                productToAdd.Qty = newQty;
                const newCartItem: CartItem = {
                    ...productToAdd,
                    qty: 1 // Initialize with qty 1 for a new item
                };
                cartItems.push(newCartItem);
            }
        }
    
        // Store the updated cart data back in local storage
        localStorage.setItem('cart', JSON.stringify(cartItems));
    
        // Update the cart count based on the number of items in the cart
        setCartCount(cartItems.length);
    
        // Update the state with the new cart items
        setCartItems(cartItems);
    };
      
    // Toggle cart dialog visibility
    const handleCartIconClick = () => {
        setVisible(!visible);
    };  
    // Categories array for checkboxes
    const categories: Category[] = [
        { name: 'All Items', key: 'All' },
        { name: 'Shoe', key: 'Shoe' },
        { name: 'Backpacks', key: 'Backpacks' },
        { name: 'Tent', key: 'Tent' },
        { name: 'Sleeping Bag', key: 'Sleeping Bag' },
        { name: 'Sleeping Pad', key: 'Sleeping Pad' },
    ];

    const [selectedCategories, setSelectedCategories] = useState<Category[]>([categories[0]]);

    // fetching api
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const selectedCategoryKeys = selectedCategories.map(cat => cat.key);
                let response;
                if (selectedCategoryKeys.toString() === 'All'){
                    response = await axios.get("https://tonyinthewild.azurewebsites.net/api/data");
                }
                else {
                    response = await axios.get("https://tonyinthewild.azurewebsites.net/api/data", {
                        params: { categories: selectedCategoryKeys.join(',') } // Send selected categories as query parameters
                    });
                }
                setProducts(response.data);
            } catch (err) {
                setError("Error fetching products ... please reload");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(storedCart.length);
        setCartItems(storedCart); // Initialize cart items state

    }, [selectedCategories]); // Re-fetch products whenever selectedCategories changes

    // sorting category
    const onCategoryChange = (e: CheckboxChangeEvent) => {
        let _selectedCategories = [...selectedCategories];
    
        if (e.checked) {
            // Add the new category to the list
            _selectedCategories.push(e.value);
    
            // If the selected category is not "All", remove "All" from the selected categories
            if (e.value.key !== 'All') {
                _selectedCategories = _selectedCategories.filter(category => category.key !== 'All');
            }
        } else {
            // Remove the unchecked category from the list
            _selectedCategories = _selectedCategories.filter(category => category.key !== e.value.key);
        }
    
        // Ensure that when 'All' is selected, all other categories are unchecked
        if (e.value.key === 'All' && e.checked) {
            _selectedCategories = [e.value]; // Only 'All' should be selected
        }
    
        setSelectedCategories(_selectedCategories);
    };
    
    // display error when cant call api
    if (loading) return <div>
        <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
            <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
    </div>;
    if (error) return <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>{error}</div>;
    
    // route to checkout
    const handleGoToCheckout = () => {
        setVisible(false);  // Close the dialog
        navigate('/checkout');  // Redirect to /checkout page
    };

    // Function to remove an item from the cart
    const removeFromCart = (productId: number) => {
        let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        const productToRemove = products.find(product => product.Id === productId);

        if (productToRemove) {
            cartItems = cartItems.filter(item => item.Id !== productId);
            productToRemove.Qty += 1; // Restore quantity back to the product

            localStorage.setItem('cart', JSON.stringify(cartItems));
            setCartItems(cartItems);
            setCartCount(cartItems.length);
        }
    };

    // Function to decrease the quantity of an item in the cart
    const decreaseCartItem = (productId: number) => {
        let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        const productToDecrease = products.find(product => product.Id === productId);
        const itemIndex = cartItems.findIndex(item => item.Id === productId);

        if (itemIndex >= 0 && productToDecrease) {
            if (cartItems[itemIndex].qty > 1) {
                cartItems[itemIndex].qty -= 1;
                productToDecrease.Qty += 1; // Restore one unit to product quantity
            } else {
                cartItems = cartItems.filter(item => item.Id !== productId);
                productToDecrease.Qty += 1; // Restore one unit to product quantity
            }

            localStorage.setItem('cart', JSON.stringify(cartItems));
            setCartItems(cartItems);
            setCartCount(cartItems.length);
        }
    };

    // Function to increase the quantity of an item in the cart
    const increaseCartItem = (productId: number) => {
        let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        const productToIncrease = products.find(product => product.Id === productId);
        const itemIndex = cartItems.findIndex(item => item.Id === productId);

        if (itemIndex >= 0 && productToIncrease && productToIncrease.Qty > 0) {
            // Increase the quantity in the cart if the product has available stock
            cartItems[itemIndex].qty += 1;
            productToIncrease.Qty -= 1; // Reduce the available stock

            localStorage.setItem('cart', JSON.stringify(cartItems));
            setCartItems(cartItems);
            setCartCount(cartItems.length);
        } else {
            console.error("Cannot increase item: Out of stock or not found");
        }
    };

    return (
        <div className="product-container">
            <Navbar cartCount={cartCount} onCartIconClick={handleCartIconClick}/> {/* Pass cartCount as prop */}
            <Splitter style={{ height: 'auto', width: 'auto' }}>
                <SplitterPanel className="flex align-items-center justify-content-center panel-left" size={10}>
                    <div className="flex flex-column gap-3">
                        <h1>Category</h1>
                        {categories.map((category) => (
                            <div key={category.key} className="flex align-items-center panel-left-text">
                                <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} />
                                <label htmlFor={category.key} className="ml-2">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </SplitterPanel>
                <SplitterPanel className="flex align-items-center justify-content-center panel-right" size={90}>
                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product.Id} className="product-card">
                                <img src={product.Photo} alt={product.Name} className="product-image" />
                                <h3>{product.BrandName}</h3>
                                <p>{product.Name}</p>
                                <p>{product.Description}</p>
                                <p>${product.Price ? product.Price.toFixed(2) : 'N/A'}</p>
                                <Button className="add-to-cart-button" onClick={() => handleAddToCart(product.Id)}>Add to Cart</Button>
                            </div>
                        ))}
                    </div>
                </SplitterPanel>
            </Splitter>

            <Dialog header="Item Added to Cart" visible={visible} onHide={() => setVisible(false)} style={{ width: '860px', height: 'auto' }}>
                <div style={{ padding: '20px' }}>
                    {cartItems.length > 0 ? (
                        <div className="cart-items-list">
                            {cartItems.map((item, index) => (
                                <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <img src={item.Photo} alt={item.Name} style={{ width: '92px', height: '92px', margin: '10px' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 0 20px', fontWeight: 'bold' }}>{item.Name}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid gray' }}>
                                        <button
                                            style={{ marginRight: '5px', padding: '5px', cursor: 'pointer', backgroundColor: 'white', border: 'none'}}
                                            onClick={() => decreaseCartItem(item.Id) }
                                        >
                                            -
                                        </button>
                                        <span style={{ margin: '0 10px' }}>{item.qty}</span>
                                        <button
                                            style={{ marginLeft: '5px', padding: '5px', cursor: 'pointer', backgroundColor: 'white', border: 'none'}}
                                            onClick={() => increaseCartItem(item.Id) }
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div style={{ marginLeft: '20px' }}>
                                        <Button label="Remove"className="p-button-text" onClick={() => removeFromCart(item.Id)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No items in the cart.</p>
                    )}
                    <div style={{ marginTop: '20px', textAlign: 'right', }}>
                        <Button style={{backgroundColor: '#D54300', color: 'white'}} label="Go to Checkout" onClick={handleGoToCheckout} className="p-button-text" />
                    </div>
                </div>
            </Dialog>

        </div>
    );
};

export default Products;
