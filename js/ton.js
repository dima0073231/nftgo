const mainBalance = document.querySelector(".main-balance");
const mainConnectWallet = document.querySelector(".main-connect-wallet");
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalHeaderBtn");

const btnTon = document.querySelector('.modal-btn-container-ton')
const btnCryptoBot = document.querySelector('.modal-btn-container-cryptoBot')
const btnTonContainer = document.querySelector('.modal-container-ton')
const btnCryptoBotContainer = document.querySelector('.modal-container-cryptoBot')


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
      const balanceNano = await getBalance(address);
      const balanceTon = (balanceNano / 1e9).toFixed(2);
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

// tonConnect.onStatusChange(async (walletInfo) => {
//   if (walletInfo && walletInfo.account && walletInfo.account.address) {
//     const address = walletInfo.account.address;
//     const shortAddr = shortenAddress(address);

//     if (mainConnectWallet) {
//       mainConnectWallet.innerText = shortAddr;
//       mainConnectWallet.disabled = true; 
//       mainConnectWallet.style.cursor = "default";
//     }

//     await updateBalance();
//   }
// });



// btnTon.addEventListener('click', () => {
//   btnCryptoBotContainer.innerHTML = ``

//   btnTon.classList.toggle('btnActive')

//   btnTonContainer.innerHTML = `
//     <form class="modal-form-ton"> 
//       <label class="label" for="sumPay">Choose sum pay</label>
//       <input type="number" name="sumPay" id="sumPay-ton" min="0.00" required />
//       <div class="modal-form-reqeired">
//         <span>Min: 0.1 TON</span>
//         <span>Max: 1000 TON</span> 
//       </div>
//       <button class="btn-ton" type="submit">Deposit with TON</button>
//     </form>
//   `;

//   const modalFormTon = document.querySelector(".modal-form-ton");
//   const sumPayTon = document.getElementById("sumPay-ton");

//   modalFormTon.addEventListener("submit", () => {

//     if (!sumPayTon) {
//       alert("Поле суммы не найдено");
//       return;
//     }

//     const amountTon = parseFloat(sumPayTon.value);
//     if (isNaN(amountTon) || amountTon <= 0) {
//       alert("Введите корректную сумму");
//       return;
//     }

//     const wallet = "UQBbEo60L7OU5bSFFpo9t10whVNDqtyo2lsvRJzIBhI-0l75";
//     const amountNanoTon = amountTon * 1e9;
//     const url = `https://tonhub.com/transfer/${wallet}?amount=${amountNanoTon}`;

//     window.open(url, "_blank");
//   });
// });


// btnCryptoBot.addEventListener('click', () => {
//   btnCryptoBotContainer.innerHTML = `
//     <form class="modal-form-cryptoBot"> 
//       <label class="label" for="sumPayCryptoBot">Choose sum pay</label>
//       <input type="number" name="sumPay" id="sumPayCryptoBot" min="0.00" required />
//       <div class="modal-form-reqeired">
//         <span>Min: 0.1 crypto</span>
//         <span>Max: 1000 crypto</span> 
//       </div>
//       <button class="btn" type="submit">Deposit with Crypto Bot</button>
//     </form>`;

//   btnTonContainer.innerHTML = ``;

//   const modalFormCrypto = document.querySelector(".modal-form-cryptoBot");
//   const sumPayCrypto = document.getElementById("sumPayCryptoBot");

//   modalFormCrypto.addEventListener("submit", (event) => {
//     event.preventDefault();

//     const amount = parseFloat(sumPayCrypto.value);
//     if (isNaN(amount) || amount <= 0) {
//       alert("Введите корректную сумму");
//       return;
//     }

//     const currency = "TON";
//     const url = `https://t.me/CryptoBot?start=send_${currency}_${amount}`;

//     window.open(url, "_blank");
//   });
// });


// function toggleActive() {
//   if (modal) {
//     modal.classList.toggle("activess");
//   }
// }

// if (mainBalance) {
//   mainBalance.addEventListener("click", toggleActive);
// }

// if (closeBtn) {
//   closeBtn.addEventListener("click", toggleActive);
// }


// setInterval(() => {
//   if (tonConnect.wallet && tonConnect.wallet.account) {
//     updateBalance();
//   }
// }, 10000);

// const mainBalance = document.querySelector(".main-balance");
// const mainConnectWallet = document.querySelector(".main-connect-wallet");
// const modal = document.getElementById("modal");
// const closeBtn = document.getElementById("closeModalHeaderBtn");
// const btnTon = document.querySelector('.modal-btn-container-ton');
// const btnCryptoBot = document.querySelector('.modal-btn-container-cryptoBot');
// const btnTonContainer = document.querySelector('.modal-container-ton');
// const btnCryptoBotContainer = document.querySelector('.modal-container-cryptoBot');

// const tonConnect = new TON_CONNECT_UI.TonConnectUI({
//   manifestUrl: "https://github.com/dima0073231/nftgo/blob/main/tonconnect-manifest.json",
//   buttonRootId: "ton-connect",
// });

function getUserTelegramId() {
  return localStorage.getItem("telegramId"); // Замени на свою реалізацію, якщо треба
}

// async function getBalance(address) {
//   try {
//     const response = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${address}`);
//     const data = await response.json();
//     if (data.ok && data.result && data.result.balance !== undefined) {
//       return data.result.balance;
//     } else {
//       throw new Error("Ошибка получения баланса");
//     }
//   } catch (error) {
//     console.error("Ошибка запроса баланса:", error);
//     throw error;
//   }
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

// function shortenAddress(address) {
//   return address.slice(0, 5) + '...' + address.slice(-4);
// }

// async function updateBalance() {
//   if (tonConnect.wallet && tonConnect.wallet.account) {
//     try {
//       const address = tonConnect.wallet.account.address;
//       const balanceNano = await getBalance(address);
//       const balanceTon = (balanceNano / 1e9).toFixed(2);
//       if (mainBalance) {
//         mainBalance.innerHTML = `
//           ${balanceTon} <img src="web/images/main/ton-icon.svg" alt="Token" class="main-balance__token">
//         `;
//       }
//     } catch (err) {
//       console.error("Не удалось получить баланс:", err);
//     }
//   }
// }

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

  modalFormTon.addEventListener("submit", (event) => {
    event.preventDefault();
    const amountTon = parseFloat(sumPayTon.value);
    if (isNaN(amountTon) || amountTon <= 0) {
      alert("Введите корректную сумму");
      return;
    }
    // Открываем ссылку на оплату
    const url = `https://tonhub.com/transfer/${TON_RECEIVER_WALLET}?amount=${amountTon * 1e9}`;
    window.open(url, "_blank");
    // Показываем форму для ввода хеша
    modalFormTon.style.display = 'none';
    modalFormTonHash.style.display = '';
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

// === Create CryptoBot Invoice через сервер ===
async function createCryptoBotInvoice(amountTon) {
  const response = await fetch("https://nftbot-4yi9.onrender.com/api/cryptobot/create-invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount: amountTon })
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || data.description || "Ошибка создания счёта");
  }
  return data.result;
}

// === CryptoBot Method Handler ===
btnCryptoBot.addEventListener('click', () => {
  btnTonContainer.innerHTML = ``;
  btnCryptoBot.classList.toggle('btnActive');

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
    <form class="modal-form-cryptoBot-invoice" style="margin-top:20px;display:none;"> 
      <label class="label" for="invoiceId">Вставьте invoiceId после оплаты</label>
      <input type="text" name="invoiceId" id="invoiceId-cryptoBot" required />
      <button class="btn" type="submit">Подтвердить пополнение</button>
    </form>
  `;

  const modalFormCrypto = document.querySelector(".modal-form-cryptoBot");
  const sumPayCrypto = document.getElementById("sumPayCryptoBot");
  const modalFormCryptoInvoice = document.querySelector(".modal-form-cryptoBot-invoice");
  const invoiceIdInput = document.getElementById("invoiceId-cryptoBot");

  modalFormCrypto.addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = parseFloat(sumPayCrypto.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Введите корректную сумму");
      return;
    }
    try {
      const invoice = await createCryptoBotInvoice(amount);
      // Сохраняем invoiceId в переменную для автозаполнения
      window.latestCryptoBotInvoiceId = invoice.invoice_id;
      window.open(invoice.pay_url, "_blank");
      // Автоматически подставляем invoiceId в форму
      invoiceIdInput.value = invoice.invoice_id;
      // Показываем форму для ввода invoiceId
      modalFormCrypto.style.display = 'none';
      modalFormCryptoInvoice.style.display = '';
    } catch (err) {
      alert("Ошибка при создании счёта: " + err.message);
      console.error(err);
    }
  });

  modalFormCryptoInvoice.addEventListener("submit", async (event) => {
    event.preventDefault();
    // invoiceId теперь всегда берём из поля (оно автозаполнено)
    const invoiceId = invoiceIdInput.value.trim() || window.latestCryptoBotInvoiceId;
    if (!invoiceId) {
      alert("Введите invoiceId");
      return;
    }
    const telegramId = getUserTelegramId();
    if (!telegramId) {
      alert("Не найден telegramId пользователя!");
      return;
    }
    try {
      const res = await fetch('https://nftbot-4yi9.onrender.com/api/addbalance/cryptobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, invoiceId })
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

// === Автоматическая проверка invoiceId из URL при загрузке ===
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('invoiceId');
  if (invoiceId) {
    const telegramId = getUserTelegramId();
    if (!telegramId) {
      alert('Не найден telegramId пользователя!');
      return;
    }
    try {
      // Проверяем статус инвойса
      const res = await fetch(`https://nftbot-4yi9.onrender.com/api/cryptobot/invoice/${invoiceId}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert('Ошибка проверки оплаты: ' + (data.error || 'Не удалось проверить статус инвойса'));
        return;
      }
      if (data.result.status === 'paid') {
        // Если оплачен — начисляем баланс
        const res2 = await fetch('https://nftbot-4yi9.onrender.com/api/addbalance/cryptobot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId, invoiceId })
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || 'Ошибка начисления');
        alert('Баланс успешно пополнен!');
        updateBalance();
        // Очищаем invoiceId из URL
        urlParams.delete('invoiceId');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert('Инвойс найден, но не оплачен. Попробуйте позже.');
      }
    } catch (err) {
      alert('Ошибка автоматической проверки оплаты: ' + err.message);
    }
  }
});

function toggleActive() {
  if (modal) {
    modal.classList.toggle("activess");
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

