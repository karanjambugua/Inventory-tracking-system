// Fetch inventory data and update dashboard
function fetchInventory() {
    axios.get('http://localhost:3000/inventory')
        .then(response => {
            const inventory = response.data;

            // Update inventory table
            const inventoryTable = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
            inventoryTable.innerHTML = ''; // Clear existing rows
            inventory.forEach(item => {
                const row = inventoryTable.insertRow();
                row.insertCell(0).innerText = item.product_name;
                row.insertCell(1).innerText = item.quantity;
                row.insertCell(2).innerText = item.price_per_unit;
                row.insertCell(3).innerText = item.threshold;
            });

            // Update total stock and average price
            const totalStock = inventory.reduce((total, item) => total + item.quantity, 0);
            const avgPrice = inventory.reduce((total, item) => total + item.price_per_unit, 0) / inventory.length;
            document.getElementById('total-stock').innerText = totalStock;
            document.getElementById('avg-stock-price').innerText = avgPrice.toFixed(2);

            // Count low stock items
            const lowStock = inventory.filter(item => item.quantity <= item.threshold).length;
            document.getElementById('low-stock-alerts').innerText = lowStock;

        })
        .catch(error => {
            console.error("Error fetching inventory data:", error);
        });
}

// Fetch financial data and update dashboard
function fetchFinancials() {
    axios.get('http://localhost:3000/financials')
        .then(response => {
            const financials = response.data;

            // Update financial table
            const financialsTable = document.getElementById('financials-table').getElementsByTagName('tbody')[0];
            financialsTable.innerHTML = ''; // Clear existing rows
            financials.transactions.forEach(transaction => {
                const row = financialsTable.insertRow();
                row.insertCell(0).innerText = transaction.date;
                row.insertCell(1).innerText = transaction.type;
                row.insertCell(2).innerText = transaction.amount;
                row.insertCell(3).innerText = transaction.details;
            });
        })
        .catch(error => {
            console.error("Error fetching financial data:", error);
        });
}

// Chart.js for stock movement visualization
function initializeStockChart() {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May'], // Example months
            datasets: [{
                label: 'Stock Level',
                data: [50, 45, 40, 35, 30], // Example data, populate dynamically
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        }
    });
}

// Call functions to populate the dashboard
document.addEventListener("DOMContentLoaded", function () {
    fetchInventory();
    fetchFinancials();
    initializeStockChart();
});
