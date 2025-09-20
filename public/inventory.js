// Initialize inventory data from the backend
let inventoryData = [];

// Function to fetch the inventory data from the server
function fetchInventory() {
    axios.get('/inventory')
        .then(response => {
            const inventoryData = response.data;  // Store the data fetched from the server
            renderInventory(inventoryData);  // Render the inventory table with the fetched data
        })
        .catch(error => {
            console.error('Error fetching inventory data:', error);
        });
}

// Function to render the inventory table
function renderInventory(inventoryData) {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';  // Clear existing rows

    inventoryData.forEach(item => {
        let row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${item.price_per_unit}</td>
            <td>${item.threshold}</td>
            <td>${item.supplier}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editProduct(${item.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${item.id})">Delete</button>
            </td>
        `;
    });
}

// Call the function to fetch inventory data when the page loads
window.onload = fetchInventory;
// Function to handle search functionality
document.getElementById('searchInput').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filteredData = inventoryData.filter(item =>
        item.product_name.toLowerCase().includes(query)
    );
    renderFilteredInventory(filteredData);
});

// Function to filter inventory by category (optional if you have categories)
document.getElementById('filterCategory').addEventListener('change', (event) => {
    const category = event.target.value;
    if (category) {
        const filteredData = inventoryData.filter(item => item.category === category);
        renderFilteredInventory(filteredData);
    } else {
        renderInventory();
    }
});

// Function to render filtered inventory
function renderFilteredInventory(filteredData) {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    filteredData.forEach((item, index) => {
        let row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${item.price_per_unit}</td>
            <td>${item.threshold}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editProduct(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${item.id})">Delete</button>
            </td>
        `;
    });
}

// Function to show the modal for adding a new product
document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('productForm').reset();
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('addProductModal').style.display = 'block';  // Show the modal
});

// Function to handle save product
document.getElementById('saveProductBtn').addEventListener('click', () => {
    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const productPrice = document.getElementById('productPrice').value;
    const productThreshold = document.getElementById('productThreshold').value;
    const productSupplier = document.getElementById('productSupplier').value;

    // Create new product object
    const newProduct = {
        product_name: productName,
        category: productCategory,
        quantity: productQuantity,
        price_per_unit: productPrice,
        threshold: productThreshold,
        supplier: productSupplier
    };

    // Send new product to backend via PUT request
    axios.put('/inventory', newProduct)
        .then(() => {
            inventoryData.push(newProduct);  // Add to local inventory data
            renderInventory();  // Re-render inventory table
            document.getElementById('addProductModal').style.display = 'none';  // Close the modal
        })
        .catch(error => {
            console.error('Error adding product:', error);
        });
});

// Function to delete product
function deleteProduct(id) {
    axios.delete(`/inventory/${id}`)
        .then(() => {
            inventoryData = inventoryData.filter(item => item.id !== id); // Remove from local data
            renderInventory();  // Re-render inventory table
        })
        .catch(error => {
            console.error('Error deleting product:', error);
        });
}

// Export function (export inventory data to CSV)
document.getElementById('exportBtn').addEventListener('click', () => {
    let csvContent = "Product Name,Quantity,Price per Unit,Threshold,Supplier\n";
    inventoryData.forEach(item => {
        csvContent += `${item.product_name},${item.quantity},${item.price_per_unit},${item.threshold},${item.supplier}\n`;
    });

    // Create a link element to download CSV
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.target = '_blank';
    link.download = 'inventory.csv';
    link.click();
});

// Close the modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('addProductModal').style.display = 'none';
});

// Initialize inventory on page load
window.onload = fetchInventory;
