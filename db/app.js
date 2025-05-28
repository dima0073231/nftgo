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