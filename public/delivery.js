document.addEventListener('DOMContentLoaded', () => {
    const totalDeliveriesElem = document.getElementById('totalDeliveries');
    const pendingDeliveriesElem = document.getElementById('pendingDeliveries');
    const completedDeliveriesElem = document.getElementById('completedDeliveries');
    const deliveryTable = document.getElementById('deliveryListBody');
    
    // Function to fetch deliveries from the server
    async function fetchDeliveries() {
        try {
            const response = await axios.get('/deliveries'); // Fetch data from the server
            return response.data;
        } catch (error) {
            console.error("Error fetching deliveries:", error);
            return [];
        }
    }

    function renderDeliveries(deliveriesToShow) {
        deliveryTable.innerHTML = ''; // Clear existing table rows
        deliveriesToShow.forEach(delivery => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${delivery.date}</td>
                <td>${delivery.productName}</td>
                <td>${delivery.quantityDelivered}</td>
                <td>${delivery.deliveryStatus}</td>
                <td>${delivery.customerName}</td>
                <td>${delivery.customerLocation}</td>
                <td>${delivery.customerPhone}</td>
                <td>${delivery.notes}</td>
                <td><a href="#" class="editBtn">Edit</a> | <a href="#" class="deleteBtn">Delete</a></td>
            `;
            deliveryTable.appendChild(row);
        });
    }
// Update the stats (total, pending, and completed deliveries)
    function updateDeliveryStats(deliveries) {
        const totalDeliveries = deliveries.length;
        const pendingDeliveries = deliveries.filter(delivery => delivery.status === 'Pending').length;
        const completedDeliveries = deliveries.filter(delivery => delivery.status === 'Completed').length;

        totalDeliveriesElem.textContent = totalDeliveries;
        pendingDeliveriesElem.textContent = pendingDeliveries;
        completedDeliveriesElem.textContent = completedDeliveries;
    }
    // Load the most recent deliveries by default
    async function loadDefaultDeliveries() {
        const deliveries = await fetchDeliveries();
        const sortedDeliveries = deliveries.sort((a, b) => b.id - a.id); // Sort by ID, descending
        renderDeliveries(sortedDeliveries.slice(0, 5)); // Show the most recent 5 deliveries
    }

    // Filter buttons actions
    recent10Btn.addEventListener('click', async () => {
        const deliveries = await fetchDeliveries();
        const sortedDeliveries = deliveries.sort((a, b) => b.id - a.id);
        renderDeliveries(sortedDeliveries.slice(0, 10)); // Show recent 10 deliveries
    });

    currentMonthBtn.addEventListener('click', async () => {
        const deliveries = await fetchDeliveries();
        const currentMonth = new Date().getMonth();
        const currentMonthDeliveries = deliveries.filter(delivery => {
            const deliveryDate = new Date(delivery.date);
            return deliveryDate.getMonth() === currentMonth;
        });
        renderDeliveries(currentMonthDeliveries);
    });

    lastMonthBtn.addEventListener('click', async () => {
        const deliveries = await fetchDeliveries();
        const lastMonth = new Date().getMonth() - 1;
        const lastMonthDeliveries = deliveries.filter(delivery => {
            const deliveryDate = new Date(delivery.date);
            return deliveryDate.getMonth() === lastMonth;
        });
        renderDeliveries(lastMonthDeliveries);
    });

    viewAllBtn.addEventListener('click', async () => {
        const deliveries = await fetchDeliveries();
        const sortedDeliveries = deliveries.sort((a, b) => b.id - a.id);
        renderDeliveries(sortedDeliveries); // Show all deliveries
    });

    // Initially load the most recent deliveries by default
    loadDefaultDeliveries();
});
