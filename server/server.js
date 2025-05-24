require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./api/users'); // Модель
const connectDB = require('./db/db'); // Подключение к MongoDB

const allowedOrigins = [
  'https://dima0073231.github.io',
  'https://dima0073231.github.io/nftgo/',
  'http://localhost:3000' // для локальной разработки
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// Middleware
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

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

// WebSocket сервер
const WebSocket = require('ws');
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server started on http://localhost:${process.env.PORT || 3000}`);
});

const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Подключился клиент. Сейчас онлайн:', clients.size);
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

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}



// if (process.env.NODE_ENV === 'development') {
//   require('./test-auto'); 
// }
