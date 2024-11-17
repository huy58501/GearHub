import React, { useEffect, useState } from "react";
import axios from "axios";
import { CartItem, Product } from "../config/Product"; // Import the Product interface for type definitions
import { Splitter, SplitterPanel } from 'primereact/splitter'; // Importing UI components for split layout
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox"; // For category filter checkboxes
import { Button } from 'primereact/button'; // Button component for adding products to cart
import Navbar from "./Navbar"; // Importing Navbar component
import { ProgressSpinner } from 'primereact/progressspinner'; // Spinner for loading state
import Cart from "./Cart"; // Import Cart component to display cart contents

// Define Category type for category filters
interface Category {
    name: string;
    key: string;
}

const Products: React.FC = () => {
    // State variables for managing products, loading state, errors, etc.
    const [products, setProducts] = useState<Product[]>([]); // Holds list of products
    const [loading, setLoading] = useState<boolean>(true); // State to show loading spinner while fetching data
    const [error, setError] = useState<string | null>(null); // Error message if API call fails
    const [visible, setVisible] = useState<boolean>(false); // Dialog visibility state (for cart)
    const [cartItems, setCartItems] = useState<CartItem[]>([]); // State for the cart items

    // Handle adding products to the cart and updating localStorage
    const handleAddToCart = (productId: number) => {
        let newQty = 0;
    
        // Extend Product type to include qty property for cart
        type CartItem = Product & { qty: number };
    
        // Retrieve existing cart items from localStorage
        let cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    
        // Find the product being added by its ID
        const existingProductIndex = cartItems.findIndex(item => item.Id === productId);
        const productToAdd = products.find(product => product.Id === productId);
    
        if (existingProductIndex >= 0 && productToAdd) {
            // If product already exists in the cart, increment its qty and update the original stock
            cartItems[existingProductIndex].qty += 1;
            newQty = productToAdd.Qty -= 1; // Decrease the product's stock quantity
            productToAdd.Qty = newQty;
        } else {
            // If product doesn't exist in the cart, add it with initial qty of 1
            if (productToAdd) {
                newQty = productToAdd.Qty -= 1; // Update the product's stock when added to cart
                productToAdd.Qty = newQty;
                const newCartItem: CartItem = {
                    ...productToAdd,
                    qty: 1 // Initialize qty as 1 when a new item is added
                };
                cartItems.push(newCartItem); // Add the new product to the cart array
            }
        }
    
        // Update localStorage with the updated cart items
        localStorage.setItem('cart', JSON.stringify(cartItems));
    
        // Update the state to reflect the new cart items
        setCartItems(cartItems);
        setVisible(true); // Open the cart dialog
    };
      
    // Toggle the visibility of the cart dialog when the cart icon is clicked
    const handleCartIconClick = () => {
        setVisible(!visible); // Toggle visibility state of the cart dialog
    };  

    // Define the categories for filtering products
    const categories: Category[] = [
        { name: 'All Items', key: 'All' },
        { name: 'Shoe', key: 'Shoe' },
        { name: 'Backpacks', key: 'Backpacks' },
        { name: 'Tent', key: 'Tent' },
        { name: 'Sleeping Bag', key: 'Sleeping Bag' },
        { name: 'Sleeping Pad', key: 'Sleeping Pad' },
    ];

    const [selectedCategories, setSelectedCategories] = useState<Category[]>([categories[0]]); // Default to "All Items"

    // Fetch products from API based on selected categories
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Get the keys of selected categories
                const selectedCategoryKeys = selectedCategories.map(cat => cat.key);
                let response;
                if (selectedCategoryKeys.toString() === 'All'){
                    // Fetch all products if 'All' is selected
                    response = await axios.get("https://tonyinthewild.azurewebsites.net/api/data");
                } else {
                    // Fetch products filtered by selected categories
                    response = await axios.get("https://tonyinthewild.azurewebsites.net/api/data", {
                        params: { categories: selectedCategoryKeys.join(',') }
                    });
                }
                setProducts(response.data); // Set the fetched products into state
            } catch (err) {
                // Handle errors and show a message if API fails
                setError("To ensure the website loads data correctly, please note that the server might take a few minutes to start, " +
                        "as it is on a free plan. This may require you to refresh the page a few times until " +
                        "the server is running and the data can be fetched properly. Thank you for your patience.");
            } finally {
                setLoading(false); // End loading state after API call
            }
        };

        fetchProducts(); // Call the fetch function

        // Initialize the cart items and count from localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(storedCart); // Set the cart items in the state

    }, [selectedCategories]); // Re-fetch products if selected categories change

    // Handle category change when checkboxes are toggled
    const onCategoryChange = (e: CheckboxChangeEvent) => {
        let _selectedCategories = [...selectedCategories];
    
        if (e.checked) {
            // If category is checked, add it to the selected categories
            _selectedCategories.push(e.value);
    
            // If 'All' is checked, deselect all other categories
            if (e.value.key !== 'All') {
                _selectedCategories = _selectedCategories.filter(category => category.key !== 'All');
            }
        } else {
            // If category is unchecked, remove it from selected categories
            _selectedCategories = _selectedCategories.filter(category => category.key !== e.value.key);
        }
    
        // Ensure only 'All' is selected when it is checked
        if (e.value.key === 'All' && e.checked) {
            _selectedCategories = [e.value]; // Only 'All' should be selected
        }
    
        setSelectedCategories(_selectedCategories); // Update the selected categories state
    };

    // Display a loading spinner if data is being fetched
    if (loading) return <div>
        <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
            <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
    </div>;

    // Display error message if there's an issue with the API
    if (error) return <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>{error}</div>;

    return (
        <div className="product-container">
            {/* Render Navbar with cart count and icon click handler */}
            <Navbar cartCount={cartItems.length} onCartIconClick={handleCartIconClick}/>
            
            {/* Layout: Splitter for category filtering and product display */}
            <Splitter style={{ height: 'auto', width: 'auto' }}>
                <SplitterPanel className="flex align-items-center justify-content-center panel-left" size={10}>
                    <div className="flex flex-column gap-3">
                        <h1>Category</h1>
                        {categories.map((category) => (
                            <div key={category.key} className="flex align-items-center panel-left-text">
                                {/* Render checkboxes for each category */}
                                <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} />
                                <label htmlFor={category.key} className="ml-2">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </SplitterPanel>

                {/* Product grid for displaying fetched products */}
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

            {/* Dialog for showing cart contents when item is added */}
            <Cart cartItems={cartItems} setCartItems={setCartItems} visible={visible} setVisible={setVisible}/>
        </div>
    );
};

export default Products;
