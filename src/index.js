import React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import ReactDOM from "react-dom/client";
import App from './App';
import 'primereact/resources/themes/saga-blue/theme.css';   /* theme */
import 'primereact/resources/primereact.min.css';           /* core css */
import 'primeicons/primeicons.css';                         /* icons */
import './styles/Navbar.css'; // Import the CSS for styling
import './styles/Products.css'; // Import the CSS for styling

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router> {/* Wrap your App inside BrowserRouter */}
      <App />
    </Router>
  </React.StrictMode>
);
