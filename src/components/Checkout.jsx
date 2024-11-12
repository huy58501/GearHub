import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Renders errors or successful transactions on the screen.
function Message({ content }) {
    return <p>{content}</p>;
}

function Paypal() {
    const initialOptions = {
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: "CAD",
        "data-page-type": "product-details",
        components: "buttons",
        "data-sdk-integration-source": "developer-studio",
    };
    console.log(initialOptions["client-id"]);
    const [message, setMessage] = useState("");
    const [cart, setCart] = useState([]);

    // Retrieve cart data from local storage on component mount
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart"));
        if (storedCart) {
            setCart(storedCart);
        } else {
            setMessage("No items in cart.");
        }
    }, []);

    // Calculate total amount from cart data
    const calculateTotalAmount = () => {
        return cart.reduce((total, item) => {
            return total + item.Price * item.qty; // Price * quantity
        }, 0);
    };

    return (
        <div className="App" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <PayPalScriptProvider options={initialOptions}>
                <div style={{ width: "300px" }}>
                    <PayPalButtons
                        style={{
                            shape: "pill",
                            layout: "vertical",
                            color: "silver",
                            label: "paypal",
                        }}
                        createOrder={async () => {
                            try {
                                const response = await fetch("https://paypal-h4fve7gygzc2ddg5.canadaeast-01.azurewebsites.net/api/orders", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        cart: cart.map(item => ({
                                            id: item.Id,
                                            quantity: item.qty,
                                        })),
                                    }),
                                });

                                const orderData = await response.json();

                                if (orderData.id) {
                                    return orderData.id;
                                } else {
                                    const errorDetail = orderData?.details?.[0];
                                    const errorMessage = errorDetail
                                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                        : JSON.stringify(orderData);

                                    throw new Error(errorMessage);
                                }
                            } catch (error) {
                                console.error(error);
                                setMessage(`Could not initiate PayPal Checkout...${error}`);
                            }
                        }}
                        onApprove={async (data, actions) => {
                            try {
                                const response = await fetch(
                                    `https://paypal-h4fve7gygzc2ddg5.canadaeast-01.azurewebsites.net/api/orders/${data.orderID}/capture`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                    }
                                );

                                const orderData = await response.json();
                                // Three cases to handle:
                                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                //   (2) Other non-recoverable errors -> Show a failure message
                                //   (3) Successful transaction -> Show confirmation or thank you message

                                const errorDetail = orderData?.details?.[0];

                                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                    return actions.restart();
                                } else if (errorDetail) {
                                    throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                                } else {
                                    const transaction = orderData.purchase_units[0].payments.captures[0];
                                    setMessage(`Transaction ${transaction.status}: ${transaction.id}. See console for all available details`);
                                    console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                                }
                            } catch (error) {
                                console.error(error);
                                setMessage(`Sorry, your transaction could not be processed...${error}`);
                            }
                        }}
                    />
                    <Message content={message} />
                </div>
            </PayPalScriptProvider>
        </div>
    );
}

export default Paypal;
