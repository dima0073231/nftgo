const inventoryBtn = document.querySelector(".user-page-inv__btn");
// const inventorySection = document.querySelector(".user-page-inventory");
// const startPlayingBtn = document.querySelector(
//   ".user-page-inventory__empty-btn"
// );
const userName = document.querySelector(".user-page-profile__name");
const userId = document.querySelector(".user-page-profile__id");
import { renderInventory } from "./buy-gift.js";

// Функция получения Telegram ID
function getTelegramId() {
  const urlParams = new URLSearchParams(window.location.search);
  const telegramId = urlParams.get("tgId");

  if (telegramId) return telegramId;

  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }

  return null;
}

// Функция подключения профиля
async function connectProfile(telegramId) {
  if (!telegramId) {
    console.log("Telegram ID не найден");
    return null;
  }

  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
    if (!response.ok) throw new Error("Ошибка сети");

    const users = await response.json();
    const user = users.find(
      (user) => String(user.telegramId) === String(telegramId)
    );

    if (!user) {
      console.log("Пользователь с таким Telegram ID не найден");
      return null;
    }

    if (userName) userName.textContent = user.username || "Без имени";
    if (userId) userId.textContent = `User ID: ${user.telegramId}`;
    // if (userAvatar)
    //   userAvatar.setAttribute("src", user.avatar || "web/images/profile/user-avatar.jpg");

    return user;
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    return null;
  }
}

// Обработчик иконки замка

// Инициализация Swiper для истории игр
if (document.querySelector(".user-page-game-history__swiper")) {
  new Swiper(".user-page-game-history__swiper", {
    direction: "vertical",
    slidesPerView: "auto",
    freeMode: true,
    mousewheel: true,
  });
}

// Подключаем профиль при загрузке

const telegramId = getTelegramId();
if (telegramId) {
  connectProfile(telegramId);
} else {
  console.log("Не удалось получить Telegram ID");
  // Устанавливаем дефолтные значения
  if (userName) userName.textContent = "Гость";
  if (userId) userId.textContent = "User ID: 0000";
}

// Получаем элементы DOM

const userBetHistoryContainer = document.querySelector(
  ".user-page-game-history__swiper"
);
const noHistoryMessage = document.querySelector(
  ".user-page-game-history__untitle"
);
const startGameButton = document.querySelector(".user-page-game-history__btn");

async function fetchBetHistory(telegramId) {
  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/history`
    );
    if (!response.ok) throw new Error("Не удалось загрузить историю ставок");
    const data = await response.json();
    return data.history || [];
  } catch (err) {
    console.error("Ошибка при загрузке истории ставок:", err);
    return [];
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Инициализация истории ставок
async function initBetHistory() {
  // Instead of localStorage:
  const history = await fetchBetHistory(telegramId);

  if (history.length > 0) {
    userBetHistoryContainer.innerHTML = `
      <div class="swiper-wrapper user-page-game-history__swiper-wrapper">
        ${history
          .map(
            (bet) => `
          <div class="user-page-game-history__card swiper-slide">
            <div class="user-page-game-history__price">
              ${Number(bet.betAmount).toFixed(2)}
              <img
                src="web/images/inventory/ton.svg"
                alt="diamond"
                class="user-page-game-history__diamond"
              />
            </div>
            <div class="user-page-game-history__data">
              Telegram Wallet <span>${formatDate(bet.date)}</span>.
            </div>
            <div class="user-page-game-history__coefficient ${bet.result}">
              ${
                bet.result === "win"
                  ? `+${(bet.betAmount * bet.coefficient).toFixed(
                      2
                    )} TON (x${Number(bet.coefficient).toFixed(2)})`
                  : `-${Number(bet.betAmount).toFixed(2)} TON`
              }
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    new Swiper(".user-page-game-history__swiper", {
      direction: "vertical",
      slidesPerView: "auto",
      freeMode: true,
      mousewheel: true,
    });
  }
}

// Функция для форматирования даты
function getCurrentDateFormatted() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Функция для добавления новой ставки в историю
function addNewBetToHistory(amount) {
  const history = JSON.parse(localStorage.getItem("betHistory"));
  history.unshift({
    amount,
    result: `-${amount.toFixed(2)} TON`,
    status: "pending",
    date: getCurrentDateFormatted(),
  });
  localStorage.setItem("betHistory", JSON.stringify(history));
  initBetHistory();
}

// Функция для обновления результата ставки
function updateBetResult(isWin, coefficient) {
  const history = JSON.parse(localStorage.getItem("betHistory")) || [];
  if (history.length > 0 && history[0].status === "pending") {
    const betAmount = history[0].amount;
    history[0].status = isWin ? "win" : "lose";
    history[0].result = isWin
      ? `+${(betAmount * coefficient).toFixed(2)} TON (x${coefficient.toFixed(
          2
        )})`
      : `-${betAmount.toFixed(2)} TON`;
    localStorage.setItem("betHistory", JSON.stringify(history));
    initBetHistory();
  }
}

// Слушаем события из других модулей
window.addEventListener("newBet", (e) => {
  addNewBetToHistory(e.detail.amount);
});

window.addEventListener("betResult", (e) => {
  updateBetResult(e.detail.isWin, e.detail.coefficient);
});

const gameHistoryWrapper = document.querySelector(
  ".user-page-game-history__swiper-wrapper"
);

function createHistoryCard({ isWin, coefficient, totalBet, date }) {
  if (totalBet === 0) return;
  const card = document.createElement("div");
  card.className = "user-page-game-history__card swiper-slide";

  card.innerHTML = `
    <div class="user-page-game-history__price">
      ${totalBet}
      <img
        src="web/images/inventory/ton.svg"
        alt="diamond"
        class="user-page-game-history__diamond"
      />
    </div>
    <div class="user-page-game-history__data" data-game-card-text>
      Telegram Wallet ${date}
    </div>
    <div
      class="user-page-game-history__coefficient ${isWin ? "win" : "lose"}"
      data-status="${isWin ? "win" : "lose"}"
    >
      ${isWin ? "+" : "-"}${coefficient.toFixed(2)}x
    </div>
  `;

  return card;
}

// Завантаження історії з localStorage
function loadHistoryFromStorage() {
  const savedHistory =
    JSON.parse(localStorage.getItem("frogGameHistory")) || [];

  for (let entry of savedHistory.reverse()) {
    const card = createHistoryCard(entry);
    gameHistoryWrapper.appendChild(card);
  }
}

// Зберегти нову гру в localStorage
function saveHistoryEntry(entry) {
  const history = JSON.parse(localStorage.getItem("frogGameHistory")) || [];
  history.push(entry);
  localStorage.setItem("frogGameHistory", JSON.stringify(history));
}

// Коли приходить результат гри
window.addEventListener("betResult", (event) => {
  const { isWin, coefficient, totalBet } = event.detail;
  if (totalBet <= 0) return;
  const date = new Date().toLocaleDateString();

  const entry = { isWin, coefficient, totalBet, date };

  const card = createHistoryCard(entry);
  gameHistoryWrapper.prepend(card);

  if (entry.totalBet > 0) {
    saveHistoryEntry(entry);
  }
});

// Початкове завантаження
loadHistoryFromStorage();

// Инициализация при загрузке страницы
initBetHistory();

if (telegramId) {
  connectProfile(telegramId);
} else {
  console.log("Не удалось получить Telegram ID");
  if (userName) userName.textContent = "Гость";
  if (userId) userId.textContent = "User ID: 0000";
}

export { telegramId };

// ... остальной существующий код ...
// Замените весь код обработчика inventoryBtn на этот:
inventoryBtn.addEventListener("click", async () => {
  const gameHistorySection = document.querySelector(".user-page-game-history");
  const inventorySection = document.querySelector(".user-page-inventory");
  const isOpen = inventorySection.classList.contains("openInvSection");
  const emptyMessage = inventorySection.querySelector(
    ".user-page-inventory__empty"
  );

  if (isOpen) {
    inventorySection.classList.remove("openInvSection");
    if (gameHistorySection) gameHistorySection.style.display = "block";
  } else {
    if (gameHistorySection) gameHistorySection.style.display = "none";
    inventorySection.classList.add("openInvSection");

    const hasInventory = checkInventoryItems(telegramId);

    if (hasInventory) {
      if (emptyMessage) emptyMessage.style.display = "none";
      renderInventory(telegramId);
    } else {
      if (emptyMessage) emptyMessage.style.display = "block";
    }
  }
});

async function checkInventoryItems(tgId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
    if (!response.ok) throw new Error("Не удалось получить пользователей");
    const users = await response.json();
    const user = users.find((user) => String(user.telegramId) === String(tgId));

    if (!user) {
      console.log("Пользователь не найден");
      return;
    }

    if (user.inventory && user.inventory.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Ошибка:", err.message);
  }
}

document.addEventListener("click", async function (e) {
  if (e.target.closest(".profile-item__withdraw")) {
    const withdrawBtn = e.target.closest(".profile-item__withdraw");
    await handleWithdrawItem(withdrawBtn, telegramId);
  }
});

async function handleWithdrawItem(clickedBtn, userId) {
  const item = clickedBtn.closest(".profile-item");
  if (!item) {
    console.error("Не удалось найти элемент профиля");
    return;
  }

  const nameElement = item.querySelector(".profile-item__name");

  if (!nameElement) {
    console.error("Не удалось найти название предмета");
    return;
  }

  const name = nameElement.textContent.trim();

  try {
    const { exec } = require("child_process");
    exec(`python c:/Users/PIV/Desktop/StavkiNFT2.0/nftgo/python/sendGift.py ${userId} "${name}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка выполнения скрипта: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка: ${stderr}`);
        return;
      }
      console.log(`Результат: ${stdout}`);
      alert("Подарок успешно отправлен!");
    });
  } catch (err) {
    console.error("Ошибка при выводе подарка:", err);
    alert("Ошибка: " + err.message);
  }
}

document.addEventListener("click", async function (e) {
  if (e.target.closest(".inventory-item__cashout")) {
    const cashoutBtn = e.target.closest(".inventory-item__cashout");
    await handleCashoutItem(cashoutBtn, telegramId);
  }
});

async function handleCashoutItem(clickedBtn, userId) {
  const item = clickedBtn.closest(".inventory-item");
  if (!item) {
    console.error("Не удалось найти элемент инвентаря");
    return;
  }

  const nameElement = item.querySelector(".inventory-item__name");

  if (!nameElement) {
    console.error("Не удалось найти название предмета");
    return;
  }

  const name = nameElement.textContent.trim();

  try {
    const { exec } = require("child_process");
    exec(`python c:/Users/PIV/Desktop/StavkiNFT2.0/nftgo/python/sendGift.py ${userId} "${name}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка выполнения скрипта: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка: ${stderr}`);
        return;
      }
      console.log(`Результат: ${stdout}`);
      alert("Подарок успешно отправлен!");
    });
  } catch (err) {
    console.error("Ошибка при выводе подарка:", err);
    alert("Ошибка: " + err.message);
  }
}
