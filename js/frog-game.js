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
import { balance } from "./balance.js";
import { telegramId } from "./profile.js";

const setBalanceToBd = async function (tgId) {
  try {
    const response = await fetch(`https://nftbotserver.onrender.com/api/users`);
    if (!response.ok) throw new Error("Користувача не знайдено");

    const users = await response.json();
    const user = users.find((user) => String(user.telegramId) === String(tgId));

    const updateRes = await fetch(
      `https://nftbotserver.onrender.com/api/users/${tgId}/balance`,
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
let gameInterval;
let isGameActive = false;
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
}

function updateGameState(crashAt) {
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

  clearInterval(gameInterval);

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
      field.textContent = "0";
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

// Обработчики stopBtns
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
        balancePole.textContent = balance.value.toFixed(2);
        const img = document.createElement("img");
        img.src = "web/images/main/ton-icon.svg";
        img.alt = "Token";
        img.className = "main-balance__token";
        balancePole.appendChild(img);
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
// import { getUserName } from "./balance.js";

// const addBetToHistory = async function (betAmount) {
//   try {
//     const username = await getUserName(telegramId);
//     const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];

//     const newEntry = {
//       username: username || "Unknown",
//       bet: betAmount,
//       time: new Date().toISOString(),
//     };

//     betHistory.push(newEntry);
//     localStorage.setItem("betHistory", JSON.stringify(betHistory));
//     addBetCards();
//   } catch (err) {
//     console.error("Error adding bet to history:", err);
//   }
// };

// function addBetCards() {
//   const container = document.querySelector(".bet-count-list");
//   if (!container) return;

//   const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];
//   const betCount = document.querySelector("#total");
//   let localBetCount = 0;
//   container.innerHTML = "";

//   betHistory
//     .slice()
//     .reverse()
//     .forEach((el) => {
//       container.insertAdjacentHTML(
//         "beforeend",
//         `
//       <li class="swiper-slide bet-count-list__item">
//         <div class="bet-count-list__profile">
//           <img
//             src="web/images/profile/user-avatar.jpg"
//             alt="user-avatar"
//             class="bet-count-list__avatar"
//           />
//           <h3 class="bet-count-list__username">${el.username}</h3>
//         </div>
//         <div class="bet-count-list__number">${el.bet.toFixed(2)}</div>
//       </li>
//       `
//       );
//       localBetCount += 1;
//     });

//   if (betCount) {
//     betCount.textContent = localBetCount;
//   }
// }

// export { addBetToHistory };

export { isGameActive, startGame, stopGame, currentCoefficient };
