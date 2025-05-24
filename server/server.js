require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./api/users'); // Модель
const connectDB = require('./db/db'); // Подключение к MongoDB

const corsOptions = {
  origin: 'https://dima0073231.github.io/nftgo/', // Точный домен вашего фронтенда на GitHub Pages
  methods: ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE'], // Разрешенные HTTP-методы
  credentials: true, // Разрешить отправку куки и заголовков авторизации
};



// Middleware
const app = express();
app.use(cors(corsOptions));
app.use(express.json());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
// Подключение к БД
connectDB();

// Роуты
app.post('/api/user', async (req, res) => {
    try {
        const user = new User(req.body); 
        await user.save();
        res.status(201).json(user);
        console.log('✅ Пользователь успешно создан:', user.username);
    } catch (err) {
        console.error('❌ Ошибка при создании пользователя:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// Маршрут для получения всех пользователей (GET-запрос)
app.get('/api/user', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
        console.log(`✅ Отправлен список из ${users.length} пользователей.`);
    } catch (err) {
        console.error('❌ Ошибка при получении пользователей:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Подключился клиент. Сейчас онлайн:', clients.size);

  // Рассылаем число онлайнов всем
  broadcastOnline();

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Клиент отключился. Сейчас онлайн:', clients.size);
    broadcastOnline();
  });
});

function broadcastOnline() {
  const count = clients.size;
  const message = JSON.stringify({ online: count });

  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}



// if (process.env.NODE_ENV === 'development') {
//   require('./test-auto'); 
// }
