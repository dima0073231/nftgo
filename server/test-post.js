const axios = require('axios');

const testUser = {
  name: 'Тестовый пользователь',
  phone: '+79998887766',
  comment: 'Это тестовый заказ для проверки API'
};

axios.post('http://localhost:3000/api/users', testUser)
  .then(response => {
    console.log('✅ Успешный ответ:');
    console.log(response.data);
    
    // Дополнительно получаем список всех заказов
    return axios.get('http://localhost:3000/api/users');
  })
  .then(response => {
    console.log('\n📦 Список всех заказов:');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Ошибка:');
    if (error.response) {
      // Сервер ответил с кодом ошибки
      console.log(error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.error(error.message);
    }
  });

