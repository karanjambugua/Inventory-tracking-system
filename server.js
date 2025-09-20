const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const axios = require('axios');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming JSON data
app.use(express.json());

// Utility function to read from JSON files
// Function to read data from a JSON file
function readData(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) reject('Error reading data');
            resolve(JSON.parse(data));
        });
    });
}

// Utility function to write to JSON files
// Function to write data to a JSON file
function writeData(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
            if (err) reject('Error writing data');
            resolve();
        });
    });
}
//path to financials.json
const financialsPath = path.join(__dirname, 'financials.json');  // __dirname will point to the current directory
// GET /financials - Fetch financial data
app.get('/financials', async (req, res) => {
  try {
    const financials = await readData('financials.json');
    res.json(financials); // Send the financial data as JSON response
  } catch (err) {
    res.status(500).send('Error fetching financial data');
  }
});

// PUT /financials - Add/update financial transaction data
app.put('/financials', async (req, res) => {
  try {
    const transaction = req.body; // Get transaction data from the frontend
    const financials = await readData('financials.json');
    
    financials.transactions.push(transaction);  // Add new transaction
    financials.balance -= transaction.amount;   // Update balance after transaction

    await writeData('financials.json', financials);
    res.send('Financial data updated');
  } catch (err) {
    res.status(500).send('Error updating financial data');
  }
});

// Serve the home.html file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// for the inventory.html
// GET /inventory - Fetch inventory data
// GET /inventory - Fetch inventory data
app.get('/inventory', async (req, res) => {
  try {
    const inventory = await readData('inventory.json');
    res.json(inventory); // Send the inventory data as JSON response
  } catch (err) {
    res.status(500).send('Error fetching inventory data');
  }
});

// PUT /inventory - Add a new product or update an existing product
app.put('/inventory', async (req, res) => {
  try {
    const updatedProduct = req.body;  // Get product data from the frontend
    const inventory = await readData('inventory.json');
    
    // Find and update the product if exists
    let product = inventory.find(item => item.id === updatedProduct.id);
    if (product) {
      product.quantity = updatedProduct.quantity;
      product.price_per_unit = updatedProduct.price_per_unit;
    } else {
      inventory.push(updatedProduct); // Add new product if not found
    }

    await writeData('inventory.json', inventory);
    res.send('Inventory updated');
  } catch (err) {
    res.status(500).send('Error updating inventory');
  }
});

// DELETE /inventory/:id - Delete a product by ID
app.delete('/inventory/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);  // Get the product ID from the request parameters
    
    // Read the current inventory
    const inventory = await readData('inventory.json');
    
    // Remove the product with the matching ID
    const updatedInventory = inventory.filter(item => item.id !== id);

    // Write the updated inventory back to file
    await writeData('inventory.json', updatedInventory);

    res.send('Product deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting product');
  }
});

// M-PESA INTEGRATION
// Your M-Pesa credentials
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

// Generate Base64 encoded credentials for authentication
const credentials = `${consumerKey}:${consumerSecret}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');

// Middleware to parse JSON data
app.use(express.json());

// Get Access Token from M-Pesa
async function getAccessToken() {
    try {
        const response = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return null;
    }
}

// Get Financial Data (Balance and Transactions)
app.get('/financials', async (req, res) => {
    try {
        const financials = await readData('financials.json');
        res.json(financials); // Send balance and transactions as JSON
    } catch (err) {
        res.status(500).send('Error fetching financial data');
    }
});

// Add Transaction (Income or Expense)
app.post('/financials', async (req, res) => {
    const { type, amount, reason } = req.body; // Transaction data from frontend
    const transaction = {
        type, // Income or Expense
        amount, // Transaction amount
        reason, // Details of the transaction
        date: new Date().toISOString(), // Current date in ISO format
    };

    try {
        const financials = await readData('financials.json');
        financials.transactions.push(transaction); // Add transaction to the list

        // Update the balance based on the transaction type
        if (type === 'Income') {
            financials.balance += amount; // Add to balance
        } else if (type === 'Expense') {
            financials.balance -= amount; // Subtract from balance
        }

        // Write updated financial data back to file
        await writeData('financials.json', financials);
        res.send('Transaction added successfully');
    } catch (err) {
        res.status(500).send('Error adding transaction');
    }
});

// Route to get delivery data
app.get('/deliveries', async (req, res) => {
    try {
        const deliveries = await readData('deliveries.json');
        res.json(deliveries);  // Return deliveries data as JSON
    } catch (err) {
        res.status(500).send('Error fetching deliveries');
    }
});


// Endpoint to add a new delivery
app.post('/deliveries', async (req, res) => {
  try {
    const newDelivery = req.body;
    const deliveries = await readData('deliveries.json');
    
    // Generate the next sequential ID
    const lastId = deliveries.length > 0 ? deliveries[deliveries.length - 1].id : 0;
    newDelivery.id = lastId + 1; // Increment the last ID by 1

    // Add the new delivery to the list
    deliveries.push(newDelivery);
    
    // Write updated deliveries back to the file
    await writeData('deliveries.json', deliveries);
    
    res.status(201).send('Delivery added successfully');
  } catch (err) {
    res.status(500).send('Error adding delivery');
  }
});

// Endpoint to update an existing delivery
app.put('/deliveries/:id', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    const updatedDelivery = req.body;

    const deliveries = await readData('deliveries.json');
    
    // Find the delivery to update
    const deliveryIndex = deliveries.findIndex(delivery => delivery.id === deliveryId);
    if (deliveryIndex === -1) {
      return res.status(404).send('Delivery not found');
    }

    // Update the delivery
    deliveries[deliveryIndex] = { ...deliveries[deliveryIndex], ...updatedDelivery };
    
    // Write updated deliveries back to the file
    await writeData('deliveries.json', deliveries);
    
    res.send('Delivery updated successfully');
  } catch (err) {
    res.status(500).send('Error updating delivery');
  }
});

// Endpoint to delete a delivery
app.delete('/deliveries/:id', async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);

    const deliveries = await readData('deliveries.json');
    
    // Find and remove the delivery
    const updatedDeliveries = deliveries.filter(delivery => delivery.id !== deliveryId);
    if (deliveries.length === updatedDeliveries.length) {
      return res.status(404).send('Delivery not found');
    }

    // Write the updated list back to the file
    await writeData('deliveries.json', updatedDeliveries);
    
    res.send('Delivery deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting delivery');
  }
});
//login
// Define the path to users.json file

// Define the path to users.json file
const filePath = path.join(__dirname, 'users.json');  // Ensure this points to the correct location of your users.json file

// Log the file path to check it's correct (optional for debugging)
console.log("File Path:", filePath);

// Route to serve users data from users.json (used to fetch users data)
app.get('/users', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error reading users data.");
        }
        try {
            const users = JSON.parse(data);  // Parse the JSON data
            res.json(users);  // Send JSON data back
        } catch (parseError) {
            return res.status(500).send("Error parsing users data.");
        }
    });
});

// Login route to verify the user's password
// Login route to verify the user's username and password (hashed password comparison)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading users.json:", err);
            return res.status(500).json({ success: false, message: "Server error reading user data." });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing users.json:", parseError);
            return res.status(500).json({ success: false, message: "Invalid user data format." });
        }

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid username or password." });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ success: false, message: "Error comparing passwords." });
            }

            if (isMatch) {
                return res.status(200).json({ success: true, message: "Login successful." });
            } else {
                return res.status(400).json({ success: false, message: "Invalid username or password." });
            }
        });
    });
});
// hashing
// Function to hash passwords before storing in users.json
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};



// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});