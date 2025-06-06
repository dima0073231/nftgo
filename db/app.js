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
socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === 'gameStateUpdate') {
    // Обновляем локальное состояние игры
    updateGameState(msg.gameState);
  }
});

// Отправка действия "клик по жабе" на сервер
function sendFrogClick(frogId) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'frogClick',
      frogId,
      playerId: getCurrentPlayerId() // Ваш метод получения ID игрока
    }));
  }
}

// Отправка действия "добавить жабу" на сервер
function sendAddFrog(x, y) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'addFrog',
      x,
      y
    }));
  }
}
