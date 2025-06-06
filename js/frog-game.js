// Элементы
const bars = document.querySelectorAll(".bar");
const coefficientDisplay = document.getElementById("coefficient");
const progressLine = document.querySelector(".line");
const frogGif = document.querySelector(".main-frog-wrapper-container__icon");
const historyTrack = document.getElementById("history-track");
const selectBetBtns = document.querySelectorAll(".select-bet__btn");
const stopBtns = document.querySelectorAll(".stop-btn");
const balancePole = document.querySelector(".main-balance");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
import { balance, renderMainInventory } from "./balance.js";
import { telegramId } from "./profile.js";
const giftBetBtns = document.querySelectorAll(
  ".inventory-down-main-item__cashout"
);

export const setBalanceToBd = async function (tgId) {
  try {
    const response = await fetch(`https://nftbot-4yi9.onrender.com/api/users`);
    if (!response.ok) throw new Error("Користувача не знайдено");

    const users = await response.json();
    const user = users.find((user) => String(user.telegramId) === String(tgId));

    const updateRes = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${tgId}/balance`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: balance.value }),
      }
    );

    if (!updateRes.ok) throw new Error("Помилка оновлення балансу");

    return true;
  } catch (err) {
    console.error("setBalanceToBd error:", err.message);
    return false;
  }
};

// Константы
const LINE_WIDTH = 380;
const BASE_GAME_SPEED = 200;
const maxHistoryItems = 7;

// Инициализация
coefficientDisplay.style.opacity = "0";

if (frogGif) {
  frogGif.style.opacity = "1";
  frogGif.style.display = "block";
}

// Анимация появления полосок
if (bars.length > 0) {
  bars.forEach((bar, index) => {
    setTimeout(() => {
      bar.style.opacity = "1";
      bar.style.transform = "translateY(0)";
    }, (index + 1) * 300);
  });
}

// Переменные игры
let currentCoefficient = 1.0;
let isGameActive = false;
let gameInterval;
let seriesQueue = [];
let seriesIndex = 0;

// Функция для переключения видимости кнопок (событие, а не setInterval)
function toggleButtons() {
  selectBetBtns.forEach((selectBtn, index) => {
    const stopBtn = stopBtns[index];
    if (!stopBtn) return;

    if (isGameActive) {
      selectBtn.style.display = "none";
      stopBtn.style.display = "block";
    } else {
      selectBtn.style.display = "block";
      stopBtn.style.display = "none";
    }
  });
}
async function handleGiftBet(giftId) {
  if (getIsGameActive()) {
    alert("Зачекайте, поки завершиться поточна гра");
    return false;
  }

  const gift = gifts.find((g) => g.name === giftId);
  if (!gift) {
    alert("Подарунок не знайдено");
    return false;
  }

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/inventory/remove`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: giftId, countToRemove: 1 }),
      }
    );

    if (!response.ok) throw new Error("Не вдалося зробити ставку подарунком");

    localStorage.setItem(
      "activeGiftBet",
      JSON.stringify({
        giftId,
        price: gift.price,
      })
    );

    window.dispatchEvent(new CustomEvent("giftBetPlaced"));
    return true;
  } catch (err) {
    console.error("Помилка при ставці подарунком:", err);
    alert("Помилка при ставці подарунком");
    return false;
  }
}
// Запускаем toggleButtons при смене состояния игры
function setGameActive(active) {
  isGameActive = active;
  toggleButtons();
}

export function getIsGameActive() {
  return isGameActive;
}

function generateCrashCoefficient() {
  if (seriesIndex >= seriesQueue.length) {
    seriesQueue = [];
    const seriesTypeRoll = Math.random();

    if (seriesTypeRoll < 0.6) {
      const length = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < length; i++) {
        const coef = 1 + Math.random() * 1.5 * Math.pow(Math.random(), 2);
        seriesQueue.push(parseFloat(coef.toFixed(2)));
      }
    } else {
      const length = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < length; i++) {
        let coef =
          Math.random() < 0.3
            ? 3.5 + Math.random() * 11.5
            : 2.0 + Math.random() * 2.0;
        seriesQueue.push(parseFloat(coef.toFixed(2)));
      }
    }
    seriesIndex = 0;
  }
  return seriesQueue[seriesIndex++];
}

function getSpeedByCoefficient(coef) {
  if (coef < 2) return 0.01;
  if (coef < 3) return 0.02;
  if (coef < 5) return 0.04;
  return 0.06;
}

// Игровой процесс
function startGame() {
  if (gameInterval) clearInterval(gameInterval);

  if (localStorage.getItem("activeGiftBet")) {
    return;
  }
  coefficientDisplay.classList.remove("crash-glow");
  coefficientDisplay.style.color = "#ffffff";
  coefficientDisplay.style.opacity = "1";

  if (progressLine) {
    progressLine.style.backgroundImage =
      "linear-gradient(135deg, #6a0dad, #b366ff)";
    progressLine.style.opacity = "1";
    progressLine.style.width = "0%";
    progressLine.style.transform = "rotate(0deg)";
  }

  if (frogGif) {
    frogGif.style.opacity = "1";
    frogGif.style.left = "0%";
    frogGif.style.transform = "translateX(-50%) scale(0.7)";
  }

  currentCoefficient = 1.0;
  coefficientDisplay.innerText = `x${currentCoefficient.toFixed(2)}`;

  setGameActive(true);

  const crashAt = generateCrashCoefficient();
  gameInterval = setInterval(() => updateGameState(crashAt), BASE_GAME_SPEED);
  updateBalanceDisplay();
}

function updateGameState(crashAt) {
  updateBalanceDisplay();
  if (!isGameActive) return;
  const speed = getSpeedByCoefficient(currentCoefficient);
  currentCoefficient = parseFloat((currentCoefficient + speed).toFixed(2));
  coefficientDisplay.innerText = `x${currentCoefficient.toFixed(2)}`;

  if (progressLine && frogGif) {
    if (currentCoefficient >= 1.0 && currentCoefficient <= 1.4) {
      const progress = (currentCoefficient - 1) / 0.4;
      progressLine.style.width = `${progress * 100}%`;
      frogGif.style.left = `100%`;
      frogGif.style.opacity = "1";
    } else if (currentCoefficient > 1.4) {
      const liftProgress = Math.min((currentCoefficient - 1.4) / 0.25, 1);
      progressLine.style.width = "100%";
      progressLine.style.transform = `rotate(-${liftProgress * 15}deg)`;
      frogGif.style.left = `${100 + liftProgress * 25}%`;
      frogGif.style.transform = `translateX(-50%) scale(${
        0.7 - liftProgress * 0.1
      })`;
    } else {
      progressLine.style.width = "0%";
      frogGif.style.opacity = "0";
    }
  }

  if (currentCoefficient >= crashAt) {
    stopGame();
  }
}

function stopGame() {
  setGameActive(false);
  updateBalanceDisplay();
  clearInterval(gameInterval);

  const giftBetEvent = new CustomEvent("checkGiftBet");
  document.dispatchEvent(giftBetEvent);

  coefficientDisplay.classList.add("crash-glow");
  coefficientDisplay.style.color = "#ff0000";
  if (progressLine) {
    progressLine.style.backgroundImage =
      "linear-gradient(135deg, #ff0000, #ff6b6b)";
  }

  addToHistory(currentCoefficient, true);

  const gameCrashEvent = new Event("gameCrash");
  document.dispatchEvent(gameCrashEvent);

  // Определяем результат игры (выигрыш или проигрыш)
  let isWin = false;
  let totalBet = 0;
  fieldBet.forEach((field) => {
    const bet = parseFloat(field.dataset.bet || "0");

    if (bet > 0) {
      totalBet += bet;
      isWin = false;

      // Обнуляємо програну ставку
      field.value = "0";
      field.dataset.bet = "0";
    }
  });

  window.dispatchEvent(
    new CustomEvent("betResult", {
      detail: {
        isWin: isWin,
        coefficient: currentCoefficient,
        totalBet: totalBet.toFixed(2),
      },
    })
  );

  if (telegramId) {
    setBalanceToBd(telegramId);
  }

  setTimeout(() => {
    coefficientDisplay.classList.remove("crash-glow");
    coefficientDisplay.style.opacity = "0";
    if (progressLine) progressLine.style.opacity = "0";
    if (frogGif) frogGif.style.opacity = "0";
  }, 2000);
}
function addToHistory(coef, isCrash) {
  const div = document.createElement("div");
  div.classList.add("main-coefficients__coefficient");
  div.classList.add(isCrash ? "lose" : "win");
  div.textContent = `${coef.toFixed(2)}x`;
  div.style.transition = "transform 0.3s ease";

  if (!historyTrack) return;

  historyTrack.insertBefore(div, historyTrack.firstChild);

  const items = historyTrack.querySelectorAll(
    ".main-coefficients__coefficient"
  );

  items.forEach((item, index) => {
    item.style.transform = `translateX(${index * 100}%)`;
  });

  if (items.length > maxHistoryItems) {
    const last = items[items.length - 1];
    last.classList.add("fade-out");
    setTimeout(() => {
      if (last.parentNode) last.parentNode.removeChild(last);
    }, 300);
  }
}
function updateBalanceDisplay() {
  if (balancePole) {
    balancePole.innerHTML = `${balance.value.toFixed(
      2
    )} <img src="web/images/main/ton-icon.svg" alt="Token" class="main-balance__token" />`;
  }
}
if (giftBetBtns.length > 0) {
  giftBetBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const giftItem = e.target.closest(".inventory-skins-items-card");
      if (!giftItem) return;

      const giftTitle = giftItem.querySelector(
        ".inventory-skins-items-card__title"
      );
      if (!giftTitle) return;

      const giftId = giftTitle.textContent.split(" x")[0].trim();
      const success = await handleGiftBet(giftId);

      if (success) {
        // Оновлюємо інвентар після успішної ставки
        renderMainInventory(telegramId);
      }
    });
  });
}
document.addEventListener("checkGiftBet", async () => {
  const activeGiftBet = localStorage.getItem("activeGiftBet");
  if (!activeGiftBet) return;

  const { giftId, price } = JSON.parse(activeGiftBet);
  const gift = gifts.find((g) => g.name === giftId);

  if (!gift) {
    console.error("Подарунок не знайдено");
    return;
  }

  const winAmount = gift.price * currentCoefficient - gift.price;

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/balance`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: balance.value + winAmount }),
      }
    );

    if (!response.ok) throw new Error("Помилка при оновленні балансу");

    balance.value += winAmount;
    updateBalanceDisplay();
    localStorage.removeItem("activeGiftBet");

    addToHistory(currentCoefficient, false);
    addBetToHistory(gift.price, currentCoefficient, true, telegramId);
  } catch (err) {
    console.error("Помилка при обробці виграшу подарунком:", err);
    await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/inventory`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: giftId, count: 1, price: 0 }),
      }
    );
    renderMainInventory(telegramId);
  }
});

document.addEventListener("gameCrash", () => {
  const activeGiftBet = localStorage.getItem("activeGiftBet");
  if (activeGiftBet) {
    const { giftId } = JSON.parse(activeGiftBet);

    // Повертаємо подарунок у разі краху
    fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/inventory`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: giftId, count: 1, price: 0 }),
      }
    ).then(() => {
      localStorage.removeItem("activeGiftBet");
      renderMainInventory(telegramId);
    });
  }
});

stopBtns.forEach((stopBtn, index) => {
  stopBtn.addEventListener("click", () => {
    const field = fieldBet[index];
    if (!field) return;

    const betValue = parseFloat(field.dataset.bet);
    if (!betValue || betValue <= 0) return;

    if (isGameActive) {
      const gain = betValue * currentCoefficient;
      balance.value += gain;
      if (balancePole) {
        updateBalanceDisplay();
      }
    }

    field.textContent = "0";
    field.dataset.bet = "0";
  });
});

setInterval(() => {
  stopBtns.forEach((stopBtn, index) => {
    const selectBtn = selectBetBtns[index];
    if (isGameActive) {
      selectBtn.style.display = "none";
      stopBtn.style.display = "block";
    } else {
      selectBtn.style.display = "block";
      stopBtn.style.display = "none";
    }
  });
}, 500);
import { getUserName } from "./balance.js";

// async function uploadBetToServer({
//   telegramId,
//   date,
//   betAmount,
//   coefficient,
//   result,
// }) {
//   try {
//     const tgId = Number(telegramId); // Always use Number for DB
//     const response = await fetch(
//       `https://nftbot-4yi9.onrender.com/api/users/${tgId}/history`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ date, betAmount, coefficient, result }),
//       }
//     );
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || "Ошибка при отправке истории ставок");
//     }
//   } catch (err) {
//     console.error("Ошибка при загрузке истории ставок на сервер:", err);
//   }
// }

// Add bet to history (and optionally to localStorage for faster UI)
const addBetToHistory = async function (
  betAmount,
  coefficient,
  isWin,
  telegramId
) {
  try {
    const domUsername = document.querySelector(
      ".user-page-profile__name"
    ).textContent;
    const username = domUsername;
    // const username = await getUserName(telegramId);

    // Додаткова перевірка перед використанням username
    if (!username) {
      alert("Не вдалося отримати ім'я користувача");
      return;
    }

    const date = new Date().toISOString();
    const betData = {
      telegramId: Number(telegramId),
      date,
      betAmount,
      coefficient,
      result: isWin ? "win" : "lose",
    };

    const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];
    const newEntry = {
      username: username,
      bet: betAmount,
      coefficient,
      isWin,
      date,
    };

    betHistory.push(newEntry);
    localStorage.setItem("betHistory", JSON.stringify(betHistory));
    addBetCards();
  } catch (err) {
    console.error("Помилка при додаванні ставки:", err);
  }
};

function addBetCards() {
  const container = document.querySelector(".bet-count-list");
  if (!container) return;

  const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];
  const betCount = document.querySelector("#total");

  // Очищаем контейнер
  container.innerHTML = "";

  // Добавляем все элементы и считаем их
  betHistory
    .slice()
    .reverse()
    .forEach((el) => {
      if (el && typeof el.bet === "number" && el.username) {
        container.insertAdjacentHTML(
          "beforeend",
          `
          <li class="swiper-slide bet-count-list__item">
            <div class="bet-count-list__profile">
              <img
                src="web/images/profile/user-avatar.jpg"
                alt="user-avatar"
                class="bet-count-list__avatar"
              />
              <h3 class="bet-count-list__username">${el.username}</h3>
            </div>
            <div class="bet-count-list__number">${el.bet.toFixed(2)}</div>
          </li>
          `
        );
      }
    });

  if (betCount) {
    betCount.textContent = container.children.length;
  }
}
addBetCards();
export { addBetToHistory };

export { isGameActive, startGame, stopGame, currentCoefficient };
