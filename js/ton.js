// const mainBalance = document.querySelector(".main-balance");
// const mainConnectWallet = document.querySelector(".main-connect-wallet");
// const modal = document.getElementById("modal");
// const openBtn = document.getElementById("openModalBtn");
// const closeBtn = document.getElementById("closeModalHeaderBtn");

// const btnTon = document.querySelector('.modal-btn-container-ton')
// const btnCryptoBot = document.querySelector('.modal-btn-container-cryptoBot')
// const btnTonContainer = document.querySelector('.modal-container-ton')
// const btnCryptoBotContainer = document.querySelector('.modal-container-cryptoBot')

// const tonConnect = new TON_CONNECT_UI.TonConnectUI({
//   manifestUrl: "https://danikkkkk12.github.io/nftbot/tonconnect-manifest.json",
//   buttonRootId: "ton-connect",
// });

// async function getBalance(address) {
//   try {
//     const response = await fetch(
//       `https://toncenter.com/api/v2/getAddressInformation?address=${address}`
//     );
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

const mainBalance = document.querySelector(".main-balance");
const mainConnectWallet = document.querySelector(".main-connect-wallet");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModalHeaderBtn");
const btnTon = document.querySelector('.modal-btn-container-ton');
const btnCryptoBot = document.querySelector('.modal-btn-container-cryptoBot');
const btnTonContainer = document.querySelector('.modal-container-ton');
const btnCryptoBotContainer = document.querySelector('.modal-container-cryptoBot');

const tonConnect = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://danikkkkk12.github.io/nftbot/tonconnect-manifest.json",
  buttonRootId: "ton-connect",
});

function getUserTelegramId() {
  return localStorage.getItem("telegramId"); // Замени на свою реалізацію, якщо треба
}

async function getBalance(address) {
  try {
    const response = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${address}`);
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

btnTon.addEventListener('click', () => {
  btnCryptoBotContainer.innerHTML = ``;
  btnTon.classList.toggle('btnActive');

  btnTonContainer.innerHTML = `
    <form class="modal-form-ton"> 
      <label class="label" for="sumPay">Choose sum pay</label>
      <input type="number" name="sumPay" id="sumPay-ton" min="0.00" required />
      <div class="modal-form-reqeired">
        <span>Min: 0.1 TON</span>
        <span>Max: 1000 TON</span> 
      </div>
      <button class="btn-ton" type="submit">Deposit with TON</button>
    </form>
  `;

  const modalFormTon = document.querySelector(".modal-form-ton");
  const sumPayTon = document.getElementById("sumPay-ton");

  modalFormTon.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!sumPayTon) {
      alert("Поле суммы не найдено");
      return;
    }

    const amountTon = parseFloat(sumPayTon.value);
    if (isNaN(amountTon) || amountTon <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    const wallet = "UQBbEo60L7OU5bSFFpo9t10whVNDqtyo2lsvRJzIBhI-0l75";
    const amountNanoTon = amountTon * 1e9;
    const url = `https://tonhub.com/transfer/${wallet}?amount=${amountNanoTon}`;

    window.open(url, "_blank");

    setTimeout(async () => {
      try {
        const tgId = getUserTelegramId();
        const address = tonConnect.wallet?.account?.address;
        if (!tgId || !address) return;

        const balanceNano = await getBalance(address);
        const balanceTon = parseFloat((balanceNano / 1e9).toFixed(2));

        const success = await setBalanceToBd(tgId, balanceTon);
        if (success) {
          console.log("Баланс успешно сохранён в БД:", balanceTon);
          updateBalance();
        }
      } catch (err) {
        console.error("Ошибка при обновлении баланса:", err.message);
      }
    }, 10000);
  });
});

btnCryptoBot.addEventListener('click', () => {
  btnCryptoBotContainer.innerHTML = `
    <form class="modal-form-cryptoBot"> 
      <label class="label" for="sumPayCryptoBot">Choose sum pay</label>
      <input type="number" name="sumPay" id="sumPayCryptoBot" min="0.00" required />
      <div class="modal-form-reqeired">
        <span>Min: 0.1 crypto</span>
        <span>Max: 1000 crypto</span> 
      </div>
      <button class="btn" type="submit">Deposit with Crypto Bot</button>
    </form>
  `;

  btnTonContainer.innerHTML = ``;

  const modalFormCrypto = document.querySelector(".modal-form-cryptoBot");
  const sumPayCrypto = document.getElementById("sumPayCryptoBot");

  modalFormCrypto.addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = parseFloat(sumPayCrypto.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    const currency = "TON";
    const url = `https://t.me/CryptoBot?start=send_${currency}_${amount}`;

    window.open(url, "_blank");
  });
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

