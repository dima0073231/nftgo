async function addBalance() {
    try {
        // Запрашиваем хэш транзакции у пользователя
        const transactionHash = prompt("Введите хэш вашей транзакции:");
        if (!transactionHash) return;
        
        const response = await axios.post('/addbalance', {
            address: currentAccount,
            transactionHash
        });
        
        alert(`Баланс пополнен! Новый баланс: ${response.data.newBalance} ETH`);
        setBalance(response.data.newBalance);
    } catch (error) {
        alert('Ошибка: ' + error.response?.data || error.message);
    }
}
const [transactions, setTransactions] = useState([]);

async function loadTransactions() {
    if (!currentAccount) return;
    try {
        const response = await axios.get(`/transactions/${currentAccount}`);
        setTransactions(response.data);
    } catch (error) {
        console.error('Failed to load transactions', error);
    }
}

// Вызывать при загрузке и после пополнения баланса
useEffect(() => {
    loadTransactions();
}, [currentAccount]);

// В компоненте добавить:
<div>
    <h3>История транзакций</h3>
    <table>
        <thead>
            <tr>
                <th>Хэш</th>
                <th>Сумма (ETH)</th>
                <th>Статус</th>
                <th>Дата</th>
            </tr>
        </thead>
        <tbody>
            {transactions.map(tx => (
                <tr key={tx._id}>
                    <td>{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.status}</td>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
            ))}
        </tbody>
    </table>
</div>