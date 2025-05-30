require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const User = require('./api/users'); // Модель
const connectDB = require('./db/db'); // Подключение к MongoDB

const app = express();

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

// Получить статус CryptoBot invoice по invoiceId
app.get('/api/cryptobot/invoice/:invoiceId', async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    if (!invoiceId) return res.status(400).json({ ok: false, error: "invoiceId required" });

    const response = await axios.get(
      `https://pay.crypt.bot/api/getInvoice?invoice_id=${invoiceId}`,
      {
        headers: {
          "Crypto-Pay-API-Token": process.env.CRYPTOBOT_TOKEN
        }
      }
    );
    if (response.data.ok && response.data.result) {
      return res.json({ ok: true, result: response.data.result });
    }
    return res.status(404).json({ ok: false, error: "Invoice not found" });
  } catch (error) {
    console.error("Error verifying CryptoBot invoice:", error);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.post("/api/cryptobot/create-invoice", async (req, res) => {
  try {
    let { amount, test } = req.body;
    amount = Number(amount);
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ ok: false, error: "Минимальная сумма — 1 TON" });
    }

    // Тестовый режим: не создаём реальный инвойс, а возвращаем фейковый invoice_id и ссылку
    if (test) {
      const fakeInvoiceId = 'test_invoice_' + Math.floor(Math.random() * 1000000);
      const testBotUrl = `https://t.me/nftgo_bot?start=invoice_${fakeInvoiceId}`;
      return res.json({
        ok: true,
        result: {
          invoice_id: fakeInvoiceId,
          pay_url: 'https://t.me/nftgo_bot',
          status: 'paid',
          paid_btn_url: testBotUrl,
          test_bot_url: testBotUrl
        }
      });
    }

    const response = await axios.post(
      "https://pay.crypt.bot/api/createInvoice",
      {
        asset: "TON",
        amount: amount.toString(), // CryptoBot API требует строку
        description: "Пополнение через NFTGo",
        hidden_message: "Спасибо за пополнение!",
        paid_btn_name: "openBot",
        paid_btn_url: "https://t.me/nftgo_bot"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Crypto-Pay-API-Token": process.env.CRYPTOBOT_TOKEN
        }
      }
    );

    if (!response.data.ok) {
      return res.status(400).json({ ok: false, error: response.data.description || "Ошибка CryptoBot" });
    }

    // Формируем ссылку для перехода в бота с invoiceId (для теста)
    const invoiceId = response.data.result.invoice_id;
    const testBotUrl = `https://t.me/nftgo_bot?start=invoice_${invoiceId}`;
    response.data.result.test_bot_url = testBotUrl;
    console.log('Ссылка для теста перехода в бота:', testBotUrl);

    res.json({ ok: true, result: response.data.result });
  } catch (err) {
    console.error("Ошибка при создании инвойса CryptoBot:", err?.response?.data || err);
    res.status(500).json({ ok: false, error: "Ошибка сервера при создании инвойса" });
  }
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

app.post('/api/addbalance/cryptobot', async (req, res) => {
  try {
    let { telegramId, invoiceId } = req.body;
    telegramId = Number(telegramId);
    if (!telegramId || isNaN(telegramId) || !invoiceId) {
      return res.status(400).json({ error: "Неверные данные (telegramId или invoiceId)" });
    }

    // Тестовый режим: если invoiceId начинается с test_invoice_, считаем оплаченным
    if (invoiceId.startsWith('test_invoice_')) {
      const user = await User.findOne({ telegramId });
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      const amount = 10; // Тестовая сумма
      user.balance += amount;
      await user.save();
      return res.json({ message: "Тестовое пополнение успешно!", balance: user.balance });
    }

    // ...реальная проверка инвойса через CryptoBot...
    const response = await axios.get(
      `https://pay.crypt.bot/api/getInvoice?invoice_id=${invoiceId}`,
      {
        headers: {
          "Crypto-Pay-API-Token": process.env.CRYPTOBOT_TOKEN
        }
      }
    );
    if (!response.data.ok || !response.data.result) {
      return res.status(400).json({ error: "Инвойс не найден или ошибка CryptoBot" });
    }
    const invoice = response.data.result;
    if (invoice.status !== 'paid') {
      return res.status(400).json({ error: "Инвойс не оплачен" });
    }
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    const amount = Number(invoice.amount);
    user.balance += amount;
    await user.save();
    res.json({ message: "Баланс успешно пополнен", balance: user.balance });
  } catch (err) {
    console.error("Ошибка при начислении баланса через CryptoBot:", err?.response?.data || err);
    res.status(500).json({ error: "Ошибка сервера при начислении баланса" });
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
    try {
        const { address, transactionHash } = req.body;
        
        // Проверяем есть ли уже такая транзакция
        const existingTx = await Transaction.findOne({ txHash: transactionHash });
        if (existingTx) {
            return res.status(400).send('Transaction already processed');
        }
        
        // Создаем запись о транзакции
        const txRecord = new Transaction({
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