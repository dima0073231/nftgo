const mainBalance = document.querySelector(".main-balance.flex") || document.querySelector(".main-balance");
const mainConnectWallet = document.querySelector(".main-connect-wallet");
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalHeaderBtn");

const btnTon = document.querySelector('.modal-btn-container-ton')
const btnCryptoBot = document.querySelector('.modal-btn-container-cryptoBot')
const btnTonContainer = document.querySelector('.modal-container-ton')
const btnCryptoBotContainer = document.querySelector('.modal-container-cryptoBot')
import { telegramId } from "./profile.js";

const tonConnect = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://dima0073231.github.io/nftgo/tonconnect-manifest.json",
  buttonRootId: "ton-connect",
});

mainConnectWallet.addEventListener("click", async () => {
  try {
    await tonConnect.connectWallet();
    const wallet = tonConnect.wallet;
    console.log("Подключено:", wallet);
  } catch (e) {
    console.error("Ошибка подключения:", e);
  }
});

async function getBalance(address) {
  try {
    const response = await fetch(
      `https://toncenter.com/api/v2/getAddressInformation?address=${address}`
    );
    const data = await response.json();

    if (data.ok && data.result && data.result.balance !== undefined) {
      return data.result.balance;
    } else {
      throw new Error("Ошибка получения баланса");
    }
  } catch (error) {
    console.error("Ошибка запроса баланса:", error);
    throw error;
  }
}

function shortenAddress(address) {
  return address.slice(0, 5) + '...' + address.slice(-4);
}


async function updateBalance() {
  if (tonConnect.wallet && tonConnect.wallet.account) {
    try {
      const address = tonConnect.wallet.account.address;
      // const balanceNano = await getBalance(address);
      // const balanceTon = (balanceNano / 1e9).toFixed(2);

      // Получаем баланс из базы данных
      const response = await fetch(`https://nftbotserver.onrender.com/api/users/${telegramId}/balance`);
      if (!response.ok) throw new Error("Ошибка получения баланса из БД");
      const data = await response.json();
      const balanceTon = data.balance.toFixed(2);

      if (mainBalance) {
        mainBalance.innerHTML = `
          ${balanceTon} <img src="web/images/main/ton-icon.svg" alt="Token" class="main-balance__token">
        `;
      }
    } catch (err) {
      console.error("Не удалось получить баланс:", err);
    }
  }
}




// // Проверка и логирование извлечения telegramId из localStorage
// function getTelegramUserId() {
//   // Проверяем, запущено ли в Telegram WebApp
//   if (window.Telegram?.WebApp) {
//     try {
//       const initData = window.Telegram.WebApp.initData;
//       const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      
//       console.log("Telegram WebApp detected", { initData, initDataUnsafe });
      
//       // Пытаемся получить ID из unsafe данных (быстрее)
//       if (initDataUnsafe?.user?.id) {
//         const tgId = telegramId
//         localStorage.setItem("telegramId", tgId);
//         return tgId;
//       }
      
//       // Если unsafe данных нет, можно попробовать парсить initData
//       if (initData) {
//         const params = new URLSearchParams(initData);
//         const userStr = params.get('user');
//         if (userStr) {
//           const user = JSON.parse(userStr);
//           if (user?.id) {
//             const tgId = user.id.toString();
//             localStorage.setItem("telegramId", tgId);
//             return tgId;
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error getting Telegram ID:", error);
//     }
//   }
  
//   // Проверяем есть ли ID в localStorage (для dev режима)
//   const storedId = localStorage.getItem("telegramId");
//   if (storedId) return storedId;
  
//   console.warn("Telegram user ID not available");
//   return null;
// }
async function setBalanceToBd(tgId, newBalance) {
  try {
    const updateRes = await fetch(`https://nftbotserver.onrender.com/api/users/${tgId}/balance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance }),
    });
    if (!updateRes.ok) throw new Error("Ошибка при обновлении баланса");
    return true;
  } catch (err) {
    console.error("setBalanceToBd error:", err.message);
    return false;
  }
}



tonConnect.onStatusChange(async (walletInfo) => {
  if (walletInfo && walletInfo.account && walletInfo.account.address) {
    const address = walletInfo.account.address;
    const shortAddr = shortenAddress(address);
    if (mainConnectWallet) {
      mainConnectWallet.innerText = shortAddr;
      mainConnectWallet.disabled = true;
      mainConnectWallet.style.cursor = "default";
    }
    await updateBalance();
  }
});

// === TON Method Handler ===
btnTon.addEventListener('click', () => {
  btnCryptoBotContainer.innerHTML = ``;
  btnTon.classList.toggle('btnActive');

  btnTonContainer.innerHTML = `
    <form class="modal-form-ton"> 
      <label class="label" for="sumPay">Сумма пополнения (TON)</label>
      <input type="number" name="sumPay" id="sumPay-ton" min="0.1" required />
      <div class="modal-form-reqeired">
        <span>Min: 0.1 TON</span>
        <span>Max: 1000 TON</span> 
      </div>
      <button class="btn-ton" type="submit">Перейти к оплате TON</button>
    </form>
    <form class="modal-form-ton-hash" style="margin-top:20px;display:none;"> 
      <label class="label" for="txHash">Вставьте хеш вашей TON-транзакции</label>
      <input type="text" name="txHash" id="txHash-ton" required />
      <button class="btn-ton" type="submit">Подтвердить пополнение</button>
    </form>
  `;

  const modalFormTon = document.querySelector(".modal-form-ton");
  const sumPayTon = document.getElementById("sumPay-ton");
  const modalFormTonHash = document.querySelector(".modal-form-ton-hash");
  const txHashInput = document.getElementById("txHash-ton");
  sumPayTon.setAttribute("step", "0.1"); // Разрешаем шаг в 0.1 для ввода дробных значений


  modalFormTon.addEventListener("submit", (event) => {
    event.preventDefault();
    const amountTon = parseFloat(sumPayTon.value);
    if (isNaN(amountTon) || amountTon <= 0) {
      alert("Введите корректную сумму");
      return;
    }
    // Открываем ссылку на оплату
    const link = document.createElement('a');
    link.href = `https://tonhub.com/transfer/${TON_RECEIVER_WALLET}?amount=${amountTon * 1e9}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Показываем форму для ввода хеша
    modalFormTon.style.display = 'none';
    modalFormTonHash.style.display = '';
    // Перенаправляем пользователя на оплату через TON
    const paymentUrl = `https://tonhub.com/transfer/${TON_RECEIVER_WALLET}?amount=${amountTon * 1e9}`;
    window.location.href = paymentUrl;
  });

  modalFormTonHash.addEventListener("submit", async (event) => {
    event.preventDefault();
    const txHash = txHashInput.value.trim();
    if (!txHash) {
      alert("Введите хеш транзакции");
      return;
    }
    const address = tonConnect.wallet?.account?.address;
    if (!address) {
      alert("Сначала подключите TON-кошелек!");
      return;
    }
    try {
      const res = await fetch('https://nftbot-4yi9.onrender.com/api/addbalance/ton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, transactionHash: txHash })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка пополнения');
      alert('Баланс успешно пополнен!');
      updateBalance();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
});

// === CryptoBot Method Handler ===
btnCryptoBot.addEventListener('click', () => {
  console.log("Кнопка CryptoBot нажата");
  btnTonContainer.innerHTML = ``; // Очистка контейнера TON
  btnCryptoBot.classList.toggle('btnActive'); // Переключение состояния кнопки

  btnCryptoBotContainer.innerHTML = `
    <form class="modal-form-cryptoBot"> 
      <label class="label" for="sumPayCryptoBot">Сумма пополнения (TON)</label>
      <input type="number" name="sumPay" id="sumPayCryptoBot" min="0.1" required />
      <div class="modal-form-reqeired">
        <span>Min: 0.1 TON</span>
        <span>Max: 1000 TON</span> 
      </div>
      <button class="btn" type="submit">Создать счет CryptoBot</button>
    </form>
  `;

  const modalFormCrypto = document.querySelector(".modal-form-cryptoBot");
  const sumPayCrypto = document.getElementById("sumPayCryptoBot");
  sumPayCrypto.setAttribute("step", "0.1"); // Разрешаем шаг в 0.1 для ввода дробных значений

  modalFormCrypto.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Форма CryptoBot отправлена");
    const amount = parseFloat(sumPayCrypto.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Введите корректную сумму");
      return;
    }
    try {

      if (!telegramId) {
        alert("Некорректный telegramId:", telegramId);
        console.error("Некорректный telegramId:", telegramId);
        return;
      }
      const invoice = await createCryptoBotInvoice(amount, telegramId); // создаём реальный invoice
      if (!invoice || !invoice.pay_url || !invoice.invoice_id) {
        throw new Error("Ошибка: сервер не вернул ссылку на оплату. Попробуйте позже.");
      }
      // Открываем ссылку на оплату в новой вкладке
      const link = document.createElement('a');
      link.href = invoice.pay_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none'; // Скрываем элемент для предотвращения визуального воздействия
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.latestCryptoBotInvoiceId = invoice.invoice_id;

      // Перенаправляем пользователя на ссылку бота
      window.location.href = invoice.pay_url;

      // Проверяем статус счета каждые 5 секунд
      const intervalId = setInterval(async () => {
        try {
          const status = await checkInvoiceStatus(invoice.invoice_id);
          if (status === "paid") {
            clearInterval(intervalId); // Останавливаем проверку
            await updateInvoiceStatus(invoice.invoice_id); // Обновляем статус и баланс
            alert("Баланс успешно пополнен!");
            updateBalance(); // Обновляем баланс на клиенте
          }
        } catch (err) {
          console.error("Ошибка проверки статуса счета:", err);
        }
      }, 5000);
    } catch (err) {
      alert("Ошибка при создании счета: " + (err.message || err));
      console.error(err);
    }
  });
});

// === Создание инвойса через сервер ===
async function createCryptoBotInvoice(amount, telegramId) {
  console.log("Отправка запроса на создание инвойса:", { amount, telegramId }); // Логирование перед запросом

  const response = await fetch("https://nftbot-4yi9.onrender.com/api/cryptobot/create-invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, telegramId }),
  });

  const text = await response.text();
  console.log("Ответ сервера:", text); // Логирование ответа сервера

  try {
    const data = JSON.parse(text);
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Ошибка создания счёта");
    }
    return data.result;
  } catch (err) {
    console.error("Ошибка обработки ответа сервера:", err); // Логирование ошибок
    throw new Error("Ошибка обработки ответа сервера: " + err.message);
  }
}

// Обновление функции для проверки статуса инвойса с использованием правильного URL
async function checkCryptoBotInvoiceStatus(invoiceId) {
  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/cryptobot/invoice/${invoiceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Ошибка проверки статуса инвойса');
    }

    return data.result.status;
  } catch (err) {
    console.error('Ошибка проверки статуса инвойса:', err);
    throw err;
  }
}

// Проверка оплаты инвойса
async function verifyInvoicePayment(invoiceId) {
  try {
    const status = await checkCryptoBotInvoiceStatus(invoiceId);

    if (status === 'paid') {
      alert('Инвойс успешно оплачен!');
      return true;
    } else if (status === 'pending') {
      alert('Инвойс ещё не оплачен. Попробуйте позже.');
      return false;
    } else {
      alert(`Инвойс имеет статус: ${status}`);
      return false;
    }
  } catch (err) {
    alert('Ошибка при проверке оплаты инвойса.');
    return false;
  }
}

// === Создание счета и добавление в БД ===
async function createInvoice(amount, telegramId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/cryptobot/create-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, telegramId }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Ошибка создания счета");
    }

    return data.result; // Возвращаем данные счета
  } catch (err) {
    console.error("Ошибка при создании счета:", err);
    throw err;
  }
}

// === Проверка статуса счета ===
async function checkInvoiceStatus(invoiceId) {
  try {
    const response = await fetch(`https://nftbot-4yi9.onrender.com/api/cryptobot/invoice/${invoiceId}`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Ошибка проверки статуса счета");
    }

    return data.result.status; // Возвращаем статус счета
  } catch (err) {
    console.error("Ошибка проверки статуса счета:", err);
    throw err;
  }
}

// === Обновление статуса счета и начисление баланса ===
async function updateInvoiceStatusAndBalance(invoiceId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/cryptobot/update-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId, status: "paid" }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Ошибка обновления статуса счета");
    }

    return data.result; // Возвращаем результат обновления
  } catch (err) {
    console.error("Ошибка обновления статуса счета:", err);
    throw err;
  }
}

// === Пример использования ===
async function handleCryptoBotPayment(amount, telegramId) {
  try {
    // Создаем счет
    const invoice = await createInvoice(amount, telegramId);
    console.log("Счет создан:", invoice);

    // Проверяем статус счета каждые 5 секунд
    const intervalId = setInterval(async () => {
      try {
        const status = await checkInvoiceStatus(invoice.invoice_id);
        console.log("Статус счета:", status);

        if (status === "paid") {
          clearInterval(intervalId); // Останавливаем проверку статуса

          // Обновляем статус счета и начисляем баланс
          const result = await updateInvoiceStatusAndBalance(invoice.invoice_id);
          console.log("Баланс обновлен:", result);
          alert("Баланс успешно пополнен!");
        }
      } catch (err) {
        console.error("Ошибка при проверке статуса счета:", err);
      }
    }, 5000);
  } catch (err) {
    console.error("Ошибка обработки платежа через CryptoBot:", err);
    alert("Ошибка: " + err.message);
  }
}

// === Глобальная переменная для хранения последнего invoiceId (устранение ошибки TS) ===
if (typeof window.latestCryptoBotInvoiceId === 'undefined') window.latestCryptoBotInvoiceId = null;

function toggleActive() {
  if (modal) {
    modal.classList.toggle("activess");
    console.log("Текущее состояние modal:", modal.classList);
  }
}

if (mainBalance) {
  mainBalance.addEventListener("click", toggleActive);
}

if (closeBtn) {
  closeBtn.addEventListener("click", toggleActive);
}

setInterval(() => {
  if (tonConnect.wallet && tonConnect.wallet.account) {
    updateBalance();
  }
}, 10000);

// Извлечение telegramId из Telegram WebApp и сохранение в localStorage
if (window.Telegram?.WebApp) {
  const initData = window.Telegram.WebApp.initDataUnsafe;
  console.log("initDataUnsafe содержимое:", initData);
  const telegramId = initData?.user?.id;


  if (telegramId && !isNaN(Number(telegramId))) {
    localStorage.setItem("telegramId", telegramId.toString());
    console.log("Telegram ID успешно сохранён в localStorage:", telegramId);
  } else {
    console.error("Не удалось получить корректный Telegram ID из WebApp. Проверьте initDataUnsafe:", initData);
  }


}