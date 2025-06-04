require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const CryptoBotAPI = require('crypto-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const frogs = new Map(); // Хранилище жаб: { id, x, y, playerId }
const User = require('./api/users'); // Модель
const connectDB = require('./db/db'); // Подключение к MongoDB
const Invoice = require('./api/invoice'); // Подключение модели Invoice
const TonTransaction = require('./api/tonTransaction'); // Подключение модели TonTransaction

const app = express();

// Инициализация клиента CryptoBotAPI
const cryptoBotClient = new CryptoBotAPI(process.env.CRYPTOBOT_TOKEN);

// ✅ CORS
app.use(cors({
  origin: 'https://dima0073231.github.io',
  credentials: true
}));


app.options('*', cors({
  origin: 'https://dima0073231.github.io',
  credentials: true
}));


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

app.get('/api/users/:telegramId/history', async (req, res) => {
  let telegramId = Number(req.params.telegramId);
  if (!telegramId || isNaN(telegramId)) {
    return res.status(400).json({ error: 'Некорректный telegramId' });
  }
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.status(200).json({ history: user.gameHistory || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить статус TON-транзакции по хешу
app.get('/api/ton/transaction/:txHash', async (req, res) => {
  try {
    const txHash = req.params.txHash;
    if (!txHash) return res.status(400).json({ ok: false, error: "txHash required" });

    // Используем функцию с сервера
    const response = await axios.get(
      `https://toncenter.com/api/v2/getTransaction?hash=${txHash}&api_key=${process.env.TONCENTER_API_TOKEN}`
    );
    if (response.data.ok && response.data.result) {
      return res.json({ ok: true, result: response.data.result });
    }
    return res.status(404).json({ ok: false, error: "Transaction not found" });
  } catch (error) {
    console.error("Error verifying TON transaction:", error);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});



// === Создание инвойса ===
app.post('/api/cryptobot/create-invoice', async (req, res) => {
  let { amount } = req.body;
  amount = Number(amount);
  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).json({ ok: false, error: 'Минимальная сумма — 1 TON' });
  }

  try {
    console.log('Запрос к CryptoBot API:', {
      asset: 'TON',
      amount: amount.toString(),
      description: 'Пополнение через NFTGo',
      hidden_message: 'Спасибо за пополнение!',
      paid_btn_name: 'openBot',
      paid_btn_url: 'https://t.me/nftgo_bot'
    });

    const response = await axios.post(
      'https://pay.crypt.bot/api/createInvoice',
      {
        asset: 'TON',
        amount: amount.toString(), // CryptoBot API требует строку
        description: 'Пополнение через NFTGo',
        hidden_message: 'Спасибо за пополнение!',
        paid_btn_name: 'openBot', // исправлено на валидное значение
        paid_btn_url: 'https://t.me/nftgo_bot'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Crypto-Pay-API-Token': process.env.CRYPTOBOT_TOKEN
        }
      }
    );

    console.log('Ответ от CryptoBot API:', response.data);

    if (!response.data.ok || !response.data.result?.invoice_id) {
      return res.status(400).json({ ok: false, error: response.data.description || 'Ошибка CryptoBot' });
    }

    // Сохранение инвойса в базу данных
    const newInvoice = new Invoice({
      invoiceId: response.data.result.invoice_id, // Убедимся, что invoice_id передается
      telegramId: req.body.telegramId, // Telegram ID пользователя
      amount, // Сумма инвойса
      status: 'pending' // Статус инвойса
    });
    await newInvoice.save();

    res.json({ ok: true, result: response.data.result });
  } catch (err) {
    console.error('Ошибка при создании инвойса CryptoBot:', err?.response?.data || err);
    res.status(500).json({ ok: false, error: 'Ошибка сервера при создании инвойса' });
  }
});

// Обновление маршрута для проверки статуса инвойса с использованием библиотеки crypto-bot-api
app.get('/api/cryptobot/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) return res.status(400).json({ ok: false, error: 'invoiceId required' });

    // Новый способ получения инвойса через getInvoices
    const invoicesData = await cryptoBotClient.getInvoices({ invoice_ids: [invoiceId] });
    const invoice = invoicesData.items?.[0];
    if (!invoice) {
      return res.status(404).json({ ok: false, error: 'Инвойс не найден' });
    }
    res.json({ ok: true, result: invoice });
  } catch (err) {
    console.error('Ошибка при проверке статуса инвойса:', err);
    res.status(500).json({ ok: false, error: 'Ошибка сервера при проверке статуса инвойса' });
  }
});


app.get('/api/cryptobot/invoice', async (req, res) => {
  try {
    const invoices = await Invoice.find(); // Получаем все инвойсы из базы данных
    res.json({ ok: true, result: invoices });
  } catch (err) {
    console.error('Ошибка при получении инвойсов:', err);
    res.status(500).json({ ok: false, error: 'Ошибка сервера при получении инвойсов' });
  }
});



// Централизованная функция обновления инвойса
async function updateInvoice(invoiceId) {
  try {
    // Проверяем наличие инвойса в базе данных
    const invoice = await Invoice.findOne({ invoiceId });
    if (!invoice) {
      return { ok: false, error: 'Инвойс не найден' };
    }

    // Получаем инвойс через getInvoices (crypto-bot-api)
    const invoicesData = await cryptoBotClient.getInvoices({ invoice_ids: [invoiceId] });
    const invoiceData = invoicesData.items?.[0];
    if (!invoiceData) {
      return { ok: false, error: 'Инвойс не найден в CryptoBot' };
    }

    if (invoiceData.status === 'paid') {
      // Обновляем статус инвойса в базе данных
      invoice.status = 'paid';
      await invoice.save();

      // Пополняем баланс пользователя
      const user = await User.findOne({ telegramId: invoice.telegramId });
      if (user) {
        user.balance += invoice.amount;
        await user.save();
      }

      return { ok: true, message: 'Инвойс оплачен, баланс обновлён' };
    } else {
      return { ok: true, message: `Инвойс имеет статус: ${invoiceData.status}` };
    }
  } catch (err) {
    console.error('Ошибка при обновлении инвойса:', err);
    return { ok: false, error: 'Ошибка сервера' };
  }
}

// === Обновление статуса инвойса и пополнение баланса ===
app.post('/api/cryptobot/update-invoice', async (req, res) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ ok: false, error: 'Не указан invoiceId' });
  }

  const result = await updateInvoice(invoiceId);
  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
});


app.post('/api/users/:telegramId/history', async (req, res) => {
  let telegramId = Number(req.params.telegramId);
  if (!telegramId || isNaN(telegramId)) {
    return res.status(400).json({ error: 'Некорректный telegramId' });
  }
  const { date, betAmount, coefficient, result } = req.body;
  if (!date || !betAmount || !coefficient || !result) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    user.gameHistory.push({ date, betAmount, coefficient, result });
    await user.save();
    res.status(200).json({ message: 'История добавлена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/addbalance/ton', async (req, res) => {
  let telegramId = Number(req.body.telegramId);
  const amount = req.body.amount;
  if (!telegramId || isNaN(telegramId) || typeof amount !== "number" || !isFinite(amount)) {
    return res.status(400).json({ error: "Неверные данные" });
  }
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    user.balance += amount;
    await user.save();
    res.json({ message: "Баланс пополнен", balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Новый роут: начисление баланса после оплаты CryptoBot ===

app.post('/api/addbalance/cryptobot', async (req, res) => {
  try {
    let { telegramId, invoiceId } = req.body;
    telegramId = Number(telegramId);
    if (!telegramId || isNaN(telegramId) || !invoiceId) {
      return res.status(400).json({ error: 'Неверные данные (telegramId или invoiceId)' });
    }

    // Проверка: использовался ли уже этот invoiceId
    const existingInvoice = await Invoice.findOne({ invoiceId });
    if (existingInvoice) {
      return res.status(400).json({ error: 'Инвойс уже использован' });
    }

    // Проверяем статус инвойса через библиотеку crypto-bot-api
    const invoice = await cryptoBotClient.getInvoice(invoiceId);

    if (invoice.status !== 'paid') {
      return res.status(400).json({ error: 'Инвойс не оплачен' });
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const amount = Number(invoice.amount);
    user.balance += amount;
    await user.save();

    // Сохраняем инвойс в БД
    await Invoice.create({
      invoiceId,
      telegramId,
      amount,
      status: invoice.status
    });

    res.json({ message: 'Баланс успешно пополнен', balance: user.balance });
  } catch (err) {
    console.error('Ошибка при начислении баланса через CryptoBot:', err);
    res.status(500).json({ error: 'Ошибка сервера при начислении баланса' });
  }
});



const { ethers } = require('ethers');


// Настройки блокчейна
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Роут для пополнения баланса
app.post('/addbalance', async (req, res) => {
    try {
        const { address, transactionHash } = req.body;
        
        // Проверяем транзакцию
        const tx = await provider.getTransaction(transactionHash);
        if (!tx) {
            return res.status(400).send('Transaction not found');
        }
        
        // Ждем подтверждения транзакции
        const receipt = await tx.wait();
        
        // Проверяем что транзакция успешна и адрес получателя - наш
        if (receipt.status !== 1 || tx.to.toLowerCase() !== wallet.address.toLowerCase()) {
            return res.status(400).send('Invalid transaction');
        }
        
        // Получаем сумму перевода (в wei)
        const value = tx.value;
        const amountInEth = ethers.utils.formatEther(value);
        
        // Обновляем баланс пользователя
        await User.updateOne(
            { address: address.toLowerCase() },
            { $inc: { balance: parseFloat(amountInEth) } }
        );
        
        res.send({ success: true, newBalance: amountInEth });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
const Transaction = require('./models/Transaction');

// Обновленный роут /addbalance
app.post('/addbalance', async (req, res) => {
    let txRecord;
    try {
        const { address, transactionHash } = req.body;
        
        // Проверяем есть ли уже такая транзакция
        const existingTx = await Transaction.findOne({ txHash: transactionHash });
        if (existingTx) {
            return res.status(400).send('Transaction already processed');
        }
        
        // Создаем запись о транзакции
        txRecord = new Transaction({
            userAddress: address.toLowerCase(),
            txHash: transactionHash,
            status: 'pending'
        });
        await txRecord.save();
        
        // Проверяем транзакцию в блокчейне
        const tx = await provider.getTransaction(transactionHash);
        if (!tx) {
            await txRecord.updateOne({ status: 'failed' });
            return res.status(400).send('Transaction not found');
        }
        
        // Ждем подтверждения
        const receipt = await tx.wait();
        
        // Проверяем валидность
        if (receipt.status !== 1 || tx.to.toLowerCase() !== wallet.address.toLowerCase()) {
            await txRecord.updateOne({ status: 'failed' });
            return res.status(400).send('Invalid transaction');
        }
        
        // Получаем сумму
        const value = tx.value;
        const amountInEth = ethers.utils.formatEther(value);
        
        // Обновляем баланс и запись о транзакции
        await Promise.all([
            User.updateOne(
                { address: address.toLowerCase() },
                { $inc: { balance: parseFloat(amountInEth) } }
            ),
            txRecord.updateOne({
                status: 'completed',
                amount: parseFloat(amountInEth),
                blockNumber: receipt.blockNumber
            })
        ]);
        
        res.send({ success: true, newBalance: amountInEth });
    } catch (error) {
        console.error(error);
        if (txRecord) {
            await txRecord.updateOne({ status: 'failed' });
        }
        res.status(500).send('Server error');
    }
});
app.get('/testdb', async (req, res) => {
    try {
        const users = await User.find();
        const txs = await Transaction.find();
        res.send({ users, txs });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Новый роут для получения истории транзакций
app.get('/transactions/:address', async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            userAddress: req.params.address.toLowerCase() 
        }).sort({ timestamp: -1 });
        
        res.send(transactions);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// === Сохранение TON-транзакций при пополнении ===
app.post('/api/ton/add-transaction', async (req, res) => {
  try {
    const { txHash, telegramId, amount } = req.body;
    if (!txHash || !telegramId || !amount) {
      return res.status(400).json({ error: 'Необходимы txHash, telegramId и amount' });
    }
    // Проверка на дублирование
    const exists = await TonTransaction.findOne({ txHash });
    if (exists) {
      return res.status(400).json({ error: 'Транзакция уже сохранена' });
    }
    const tx = new TonTransaction({ txHash, telegramId, amount, status: 'pending' });
    await tx.save();
    res.json({ ok: true, message: 'TON-транзакция сохранена', tx });
  } catch (err) {
    console.error('Ошибка при сохранении TON-транзакции:', err);
    res.status(500).json({ error: 'Ошибка сервера при сохранении TON-транзакции' });
  }
});

// === Проверка статуса TON-транзакции (для ton.js) ===
app.get('/api/ton/check-status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    if (!txHash) return res.status(400).json({ status: 'error', error: 'txHash required' });
    const tx = await TonTransaction.findOne({ txHash });
    if (!tx) return res.status(404).json({ status: 'not_found' });
    if (tx.status === 'confirmed') {
      return res.json({ status: 'confirmed' });
    } else {
      return res.json({ status: 'pending' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});



// === CRON: Периодическая проверка и обновление статусов инвойсов CryptoBot ===
cron.schedule('*/2 * * * *', async () => {
  try {
    const invoices = await Invoice.find({ status: 'pending' });
    for (const invoice of invoices) {
      try {
        // Получаем актуальный статус инвойса через CryptoBot API
        const invoicesData = await cryptoBotClient.getInvoices({ invoice_ids: [invoice.invoiceId] });
        const invoiceData = invoicesData.items?.[0];
        if (invoiceData && invoiceData.status === 'paid') {
          invoice.status = 'paid';
          await invoice.save();
          // Пополняем баланс пользователя
          const user = await User.findOne({ telegramId: invoice.telegramId });
          if (user) {
            user.balance += invoice.amount;
            await user.save();
            console.log(`Баланс пользователя ${invoice.telegramId} пополнен на ${invoice.amount} TON`);
          }
        }
      } catch (err) {
        console.error(`Ошибка проверки инвойса ${invoice.invoiceId}:`, err?.response?.data || err);
      }
    }
  } catch (err) {
    console.error('Ошибка периодической проверки инвойсов CryptoBot:', err);
  }
});

// === CRON: Периодическая проверка и обновление статусов TON-транзакций ===
cron.schedule('*/2 * * * *', async () => {
  try {
    const pendingTxs = await TonTransaction.find({ status: 'pending' });
    for (const tx of pendingTxs) {
      try {
        // Проверяем статус транзакции через toncenter (используем BOC как hash, если это реально hash)
        const response = await axios.get(
          `https://tonapi.io/v2/blockchain/transactions/${tx.txHash}`
        );
        // Если транзакция найдена и успешна
        if (response.data && response.data.transaction && response.data.transaction.status === 'finalized') {
          tx.status = 'confirmed';
          await tx.save();
          // Пополняем баланс пользователя
          const user = await User.findOne({ telegramId: tx.telegramId });
          if (user) {
            user.balance += tx.amount;
            await user.save();
            console.log(`TON: Баланс пользователя ${tx.telegramId} пополнен на ${tx.amount} TON`);
          }
        }
      } catch (err) {
        // Не найдено или ошибка — просто пропускаем
        // Можно логировать для отладки: console.error(`TON: Ошибка проверки транзакции ${tx.txHash}:`, err?.response?.data || err);
      }
    }
  } catch (err) {
    console.error('TON: Ошибка периодической проверки транзакций:', err);
  }
});



// ✅ Создаём HTTP-сервер вручную (для WebSocket)
const server = http.createServer(app); // ✅ оборачиваем express в http-сервер
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
socket.on('message', (data) => {
  const msg = JSON.parse(data);
  
  // Игрок кликнул по жабе
  if (msg.type === 'frogClick') {
    const frog = gameState.frogs.find(f => f.id === msg.frogId);
    if (frog && !frog.clickedBy) {
      frog.clickedBy = msg.playerId;
      gameState.scores[msg.playerId] = (gameState.scores[msg.playerId] || 0) + 1;
      
      // Рассылаем обновление всем
      broadcastGameState();
    }
  }
  
  // Игрок добавил новую жабу
  else if (msg.type === 'addFrog') {
    gameState.frogs.push({
      id: Date.now().toString(),
      x: msg.x,
      y: msg.y,
      clickedBy: null
    });
    broadcastGameState();
  }
});

// Отправляет текущее состояние игры всем клиентам
function broadcastGameState() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'gameStateUpdate',
        gameState
      }));
    }
  });
}


function broadcastOnline() {
  const count = clients.size;
  const message = JSON.stringify({ online: count });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
app.get('/users/:param')  // Ошибка: после `:` нет имени параметра

// 🚀 запуск
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});

