document.addEventListener("DOMContentLoaded", function() {
    fetchFinancialData();

    // Button click listener to add a transaction
    document.getElementById("saveTransactionBtn").addEventListener("click", saveTransaction);
});

function fetchFinancialData() {
    // Fetch financial data from the server
    axios.get('/financials')
        .then(response => {
            const financials = response.data;
            document.getElementById("balance").innerText = `Balance: Ksh ${financials.balance}`;
            document.getElementById("boxesAvailable").innerText = `Amount of Boxes Available: ${financials.transactions.length}`; // Assuming boxes are represented by transactions for now
            renderTransactions(financials.transactions);
        })
        .catch(error => {
            console.error('Error fetching financial data:', error);
        });
}

function renderTransactions(transactions) {
    const transactionsTable = document.getElementById("financialsTable").getElementsByTagName('tbody')[0];
    transactionsTable.innerHTML = '';  // Clear current table
    transactions.forEach(transaction => {
        const row = transactionsTable.insertRow();
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td>${transaction.reason}</td>
            <td>
                <button class="btn btn-warning" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;
    });
}

function saveTransaction() {
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("transactionType").value;
    const reason = document.getElementById("reason").value;

    // Send the new transaction to the server
    axios.post('/financials', {
        amount: parseFloat(amount),
        type: type,
        reason: reason,
        date: new Date().toISOString(),
        id: Date.now()  // Use current timestamp as a unique ID
    })
    .then(response => {
        console.log('Transaction saved');
        fetchFinancialData();  // Refresh data after adding
    })
    .catch(error => {
        console.error('Error saving transaction:', error);
    });
}

function editTransaction(id) {
    // Implement logic to edit a transaction
}

function deleteTransaction(id) {
    // Implement logic to delete a transaction
}
