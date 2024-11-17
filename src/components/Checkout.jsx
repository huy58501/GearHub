import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Component to display error or success messages
function Message({ content }) {
    return <p>{content}</p>;
}

function Paypal() {
    // Initialize PayPal options with necessary parameters (client ID, currency, etc.)
    const initialOptions = {
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID, // PayPal Client ID from environment variables
        "enable-funding": "venmo", // Enable Venmo as a funding option
        "disable-funding": "", // Disable no funding options
        currency: "CAD", // Set currency to CAD
        "data-page-type": "product-details", // Page type information for PayPal tracking
        components: "buttons", // Render only the buttons
        "data-sdk-integration-source": "developer-studio", // SDK integration source
    };

    const [message, setMessage] = useState(""); // State to hold message for success or error

    return (
        <div className="App" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh"}}>
            {/* PayPal Script Provider that wraps the PayPal Buttons */}
            <PayPalScriptProvider options={initialOptions}>
                <div style={{ width: "300px" }}>
                    {/* PayPal Buttons component */}
                    <PayPalButtons
                        style={{
                            shape: "pill", // Pill-shaped buttons
                            layout: "vertical", // Display the buttons vertically
                            color: "silver", // Button color is silver
                            label: "paypal", // Button label is 'paypal'
                        }} 
                        createOrder={async () => {
                            try {
                                // Send a request to the backend to create a PayPal order
                                const response = await fetch("https://paypal-h4fve7gygzc2ddg5.canadaeast-01.azurewebsites.net/api/orders", {
                                    method: "POST", // POST request to create the order
                                    headers: {
                                        "Content-Type": "application/json", // JSON body
                                    },
                                    body: JSON.stringify({
                                        cartItems: [
                                            {
                                                id: "YOUR_PRODUCT_ID", // Replace with product ID
                                                quantity: "YOUR_PRODUCT_QUANTITY", // Replace with product quantity
                                            },
                                        ],
                                    }),
                                });

                                const orderData = await response.json(); // Parse the response as JSON

                                console.log("response status:", response.status);
                                console.log("orderData:", JSON.stringify(orderData, null, 2));

                                // If order is successfully created, return the order ID
                                if (orderData.id) {
                                    return orderData.id;
                                } else {
                                    const errorDetail = orderData?.details?.[0]; // Extract error detail if available
                                    const errorMessage = errorDetail
                                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                        : JSON.stringify(orderData);

                                    throw new Error(errorMessage); // Throw error if order creation failed
                                }
                            } catch (error) {
                                console.error(error); // Log the error to the console
                                setMessage(`Could not initiate PayPal Checkout...${error}`); // Display error message
                            }
                        }} 
                        onApprove={async (data, actions) => {
                            try {
                                // Send a request to capture the payment after approval
                                const response = await fetch(
                                    `https://paypal-h4fve7gygzc2ddg5.canadaeast-01.azurewebsites.net/api/orders/${data.orderID}/capture`,
                                    {
                                        method: "POST", // POST request to capture payment
                                        headers: {
                                            "Content-Type": "application/json", // JSON body
                                        },
                                    }
                                );

                                const orderData = await response.json(); // Parse the response as JSON

                                const errorDetail = orderData?.details?.[0]; // Extract any error details

                                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                    // Handle recoverable errors (e.g., INSTRUMENT_DECLINED) by restarting the checkout
                                    return actions.restart();
                                } else if (errorDetail) {
                                    // Handle other non-recoverable errors
                                    throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                                } else {
                                    // Successful transaction: Show confirmation message
                                    const transaction = orderData.purchase_units[0].payments.captures[0];
                                    setMessage(
                                        `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                                    );
                                    console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                                }
                            } catch (error) {
                                console.error(error); // Log the error to the console
                                setMessage(`Sorry, your transaction could not be processed...${error}`); // Display error message
                            }
                        }} 
                    />
                    {/* Render the success or error message */}
                    <Message content={message} />
                </div>
            </PayPalScriptProvider>
        </div>
    );
}

export default Paypal;
