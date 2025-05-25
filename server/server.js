require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const User = require('./api/user'); // Модель
const connectDB = require('./db/db'); // Подключение к MongoDB

const app = express();

// ✅ CORS — разрешаем запросы с GitHub Pages
app.use(cors({
  origin: 'https://dima0073231.github.io',
  credentials: true
}));

// ✅ Для preflight-запросов (OPTIONS)
app.options('*', cors({
  origin: 'https://dima0073231.github.io',
  credentials: true
}));

// ✅ Middleware для JSON-тел запросов
app.use(express.json());

// Подключение к БД
connectDB();

// 📦 Роуты
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const WebSocket = require('ws');
// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});

// WebSocket сервер

// const server = app.listen(process.env.PORT || 3000, () => {
//   console.log(`🚀 Server started on http://localhost:${process.env.PORT || 3000}`);
// });

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