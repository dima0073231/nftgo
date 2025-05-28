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
function updateBalanceDisplay() {
  if (balancePole) {
    balancePole.innerHTML = `${balance.value.toFixed(
      2
    )} <img src="web/images/main/ton-icon.svg" alt="Token" class="main-balance__token" />`;
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
// const bars = document.querySelectorAll(".bar");
// const coefficientDisplay = document.getElementById("coefficient");
// const progressLine = document.querySelector(".line");
// const frogGif = document.querySelector(".main-frog-wrapper-container__icon");
// const historyTrack = document.getElementById("history-track");
// const selectBetBtns = document.querySelectorAll(".select-bet__btn"); // For toggling display
// const stopBtns = document.querySelectorAll(".stop-btn"); // For toggling display and event listeners
// // const balancePole = document.querySelector(".main-balance"); // Handled by balance.js
// const fieldBet = document.querySelectorAll(".select-bet-count__number"); // For clearing after game

// // Import from balance.js
// import {
//   balance,
//   activeGiftBet,
//   currentBetType,
//   renderMainInventory,
//   balanceTelegramId, // Using the aliased export
//   updateBalanceDisplay,
//   resetGiftBetState, // Can be called if needed, though events are preferred
// } from "./balance.js";

// import { telegramId as profileTelegramId } from "./profile.js"; // Original telegramId import

// const telegramId = profileTelegramId || balanceTelegramId; // Ensure telegramId is available

// // setBalanceToBd function (remains the same)
// const setBalanceToBd = async function (tgIdNum) {
//   // Ensure tgIdNum is a number
//   try {
//     // const response = await fetch(`https://nftbot-4yi9.onrender.com/api/users`); // Not needed, directly PATCH
//     // if (!response.ok) throw new Error("Користувача не знайдено при GET ALL");
//     // const users = await response.json();
//     // const user = users.find((user) => String(user.telegramId) === String(tgIdNum)); // Not needed
//     // if (!user) throw new Error("Користувача не знайдено для оновлення балансу");

//     const updateRes = await fetch(
//       `https://nftbot-4yi9.onrender.com/api/users/${tgIdNum}/balance`,
//       {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ balance: parseFloat(balance.value.toFixed(2)) }), // Send precise balance
//       }
//     );
//     if (!updateRes.ok) {
//       const errorData = await updateRes.json();
//       throw new Error(
//         `Помилка оновлення балансу: ${errorData.error || updateRes.statusText}`
//       );
//     }
//     console.log("Balance updated on server for user:", tgIdNum);
//     return true;
//   } catch (err) {
//     console.error("setBalanceToBd error:", err.message);
//     return false;
//   }
// };
// const LINE_WIDTH = 380;
// const BASE_GAME_SPEED = 200;

// // Инициализация
// coefficientDisplay.style.opacity = "0";

// if (frogGif) {
//   frogGif.style.opacity = "1";
//   frogGif.style.display = "block";
// }

// // Анимация появления полосок
// if (bars.length > 0) {
//   bars.forEach((bar, index) => {
//     setTimeout(() => {
//       bar.style.opacity = "1";
//       bar.style.transform = "translateY(0)";
//     }, (index + 1) * 300);
//   });
// }

// // Переменные игры
// let currentCoefficient = 1.0; // Exported, as per original
// let gameInterval;
// let isGameActive = false; // Local to frog-game, exported via getIsGameActive
// let seriesQueue = [];
// let seriesIndex = 0;

// function toggleButtons() {
//   selectBetBtns.forEach((selectBtn, index) => {
//     const stopBtn = stopBtns[index];
//     if (!stopBtn) return;

//     if (isGameActive) {
//       selectBtn.style.display = "none";
//       stopBtn.style.display = "block";
//     } else {
//       selectBtn.style.display = "block";
//       stopBtn.style.display = "none";
//     }
//   });
// }

// function setGameActive(active) {
//   isGameActive = active;
//   toggleButtons();
//   // Also trigger button state update in balance.js as game state changes interactivity
//   if (typeof updateButtonsState === "function") {
//     // Check if balance.js's function is available (it should be after imports)
//     // updateButtonsState(); // This is called by interval in balance.js already
//   } else if (
//     window.balanceJsModule &&
//     typeof window.balanceJsModule.updateButtonsState === "function"
//   ) {
//     // Fallback if direct import is complex, though direct import is better
//     // window.balanceJsModule.updateButtonsState();
//   }
// }

// function getIsGameActive() {
//   return isGameActive;
// }

// function generateCrashCoefficient() {
//   if (seriesIndex >= seriesQueue.length) {
//     seriesQueue = [];
//     const seriesTypeRoll = Math.random();

//     if (seriesTypeRoll < 0.6) {
//       const length = Math.floor(Math.random() * 3) + 2;
//       for (let i = 0; i < length; i++) {
//         const coef = 1 + Math.random() * 1.5 * Math.pow(Math.random(), 2);
//         seriesQueue.push(parseFloat(coef.toFixed(2)));
//       }
//     } else {
//       const length = Math.floor(Math.random() * 5) + 1;
//       for (let i = 0; i < length; i++) {
//         let coef =
//           Math.random() < 0.3
//             ? 3.5 + Math.random() * 11.5
//             : 2.0 + Math.random() * 2.0;
//         seriesQueue.push(parseFloat(coef.toFixed(2)));
//       }
//     }
//     seriesIndex = 0;
//   }
//   return seriesQueue[seriesIndex++];
// }

// function getSpeedByCoefficient(coef) {
//   if (coef < 2) return 0.01;
//   if (coef < 3) return 0.02;
//   if (coef < 5) return 0.04;
//   return 0.06;
// }
// function startGame() {
//   // Exported, called by balance.js

//   if (gameInterval) clearInterval(gameInterval);

//   // Reset visual elements
//   coefficientDisplay.classList.remove("crash-glow");
//   coefficientDisplay.style.color = "#ffffff";
//   coefficientDisplay.style.opacity = "1";
//   if (progressLine) {
//     progressLine.style.backgroundImage =
//       "linear-gradient(135deg, #6a0dad, #b366ff)";
//     progressLine.style.opacity = "1";
//     progressLine.style.width = "0%";
//     progressLine.style.transform = "rotate(0deg)";
//   }
//   if (frogGif) {
//     frogGif.style.opacity = "1";
//     frogGif.style.left = "0%"; // Start position
//     frogGif.style.transform = "translateX(-50%) scale(0.7)";
//   }

//   currentCoefficient = 1.0;
//   coefficientDisplay.innerText = `x${currentCoefficient.toFixed(2)}`;
//   setGameActive(true);

//   const crashAt = generateCrashCoefficient();
//   console.log(`Game starting. Crash target: x${crashAt.toFixed(2)}`);
//   gameInterval = setInterval(() => updateGameState(crashAt), BASE_GAME_SPEED);
//   // updateBalanceDisplay(); // Balance display is handled by balance.js
// }

// function updateGameState(crashAt) {
//   if (!isGameActive) return; // Ensure game is active
//   const speed = getSpeedByCoefficient(currentCoefficient);
//   currentCoefficient = parseFloat((currentCoefficient + speed).toFixed(2));
//   coefficientDisplay.innerText = `x${currentCoefficient.toFixed(2)}`;

//   // Animation logic for progressLine and frogGif (remains the same)
//   // ...
//   if (progressLine && frogGif) {
//     if (currentCoefficient >= 1.0 && currentCoefficient <= 1.4) {
//       const progress = (currentCoefficient - 1) / 0.4;
//       progressLine.style.width = `${progress * 100}%`;
//       // Frog moves with the end of the line if progress based, or fixed logic
//       frogGif.style.left = `${Math.min(progress * 100, 100)}%`; // Ensure frog doesn't go beyond 100% during this phase
//       frogGif.style.opacity = "1";
//     } else if (currentCoefficient > 1.4) {
//       const liftProgress = Math.min((currentCoefficient - 1.4) / 0.25, 1); // Normalized progress for lifting phase
//       progressLine.style.width = "100%";
//       progressLine.style.transform = `rotate(-${liftProgress * 15}deg)`; // Max 15deg rotation
//       // Frog's horizontal position might need adjustment if it's "lifting off"
//       frogGif.style.left = `${100 + liftProgress * 10}%`; // Example: slight move forward during lift
//       frogGif.style.transform = `translateX(-50%) translateY(-${
//         liftProgress * 30
//       }px) scale(${0.7 - liftProgress * 0.1})`; // Example: lift up and scale down
//     } else {
//       // Should not happen if currentCoefficient starts at 1.0 and increases
//       progressLine.style.width = "0%";
//       frogGif.style.opacity = "0"; // Or reset to start
//     }
//   }

//   if (currentCoefficient >= crashAt) {
//     console.log(
//       `Crash! Coefficient x${currentCoefficient.toFixed(
//         2
//       )} reached target x${crashAt.toFixed(2)}`
//     );
//     stopGame(); // Game ends due to crash
//   }
// }

// function stopGame() {
//   // Called on CRASH
//   if (!isGameActive) return; // Prevent multiple calls
//   setGameActive(false);
//   clearInterval(gameInterval);

//   console.log(
//     "Game stopped (CRASH) at coefficient:",
//     currentCoefficient.toFixed(2)
//   );

//   coefficientDisplay.classList.add("crash-glow");
//   coefficientDisplay.style.color = "#ff0000";
//   if (progressLine) {
//     progressLine.style.backgroundImage =
//       "linear-gradient(135deg, #ff0000, #ff6b6b)";
//   }

//   addToHistory(currentCoefficient, true); // true for crash (lose appearance on history bar)

//   document.dispatchEvent(new Event("gameCrash")); // For balance.js or other listeners

//   let betAmountForHistory = 0;
//   let anyBetLost = false;

//   if (currentBetType === "gift" && activeGiftBet) {
//     console.log("Gift bet lost:", activeGiftBet.name);
//     betAmountForHistory = activeGiftBet.price;
//     anyBetLost = true;
//     // Gift was already removed from inventory. Balance not affected here.
//     // Server state for gift is already correct (removed).
//   } else if (currentBetType === "money") {
//     fieldBet.forEach((field) => {
//       const betVal = parseFloat(field.dataset.bet || "0");
//       if (betVal > 0) {
//         anyBetLost = true;
//         betAmountForHistory += betVal; // Sum up all numerical bets for history
//         console.log(`Numerical bet of ${betVal} lost.`);
//         field.dataset.bet = "0"; // Clear the committed bet
//         // field.textContent = "0"; // balance.js event listener will clear textContent
//       }
//     });
//     // Balance was already deducted when bet was placed.
//   }

//   if (anyBetLost) {
//     window.dispatchEvent(
//       new CustomEvent("betResult", {
//         detail: {
//           isWin: false,
//           coefficient: currentCoefficient,
//           betAmount: betAmountForHistory,
//           betType: currentBetType,
//           itemName: activeGiftBet ? activeGiftBet.name : null,
//           itemImage: activeGiftBet ? activeGiftBet.image : null,
//         },
//       })
//     );
//   }

//   // Save balance (might not have changed for gift loss, but good practice)
//   if (telegramId) {
//     setBalanceToBd(Number(telegramId));
//   }

//   // Reset UI after a delay
//   setTimeout(() => {
//     coefficientDisplay.classList.remove("crash-glow");
//     coefficientDisplay.style.opacity = "0";
//     if (progressLine) progressLine.style.opacity = "0";
//     if (frogGif) frogGif.style.opacity = "0";
//     // fieldBet textContents are cleared by balance.js's 'gameCrash' listener
//   }, 2000);

//   // Call resetGiftBetState through the event it listens to, or directly if sure.
//   // The "gameCrash" event handles this in balance.js.
// }

// function addToHistory(coef, isCrash) {
//   // This is for the visual coefficient history bar
//   const div = document.createElement("div");
//   div.classList.add("main-coefficients__coefficient");
//   div.classList.add(isCrash ? "lose" : "win");
//   div.textContent = `${coef.toFixed(2)}x`;
//   // div.style.transition = "transform 0.3s ease"; // CSS should handle this

//   if (!historyTrack) return;
//   historyTrack.insertBefore(div, historyTrack.firstChild);
//   const items = historyTrack.querySelectorAll(
//     ".main-coefficients__coefficient"
//   );
//   // items.forEach((item, index) => { // This transform might be for a different animation style
//   //   item.style.transform = `translateX(${index * 100}%)`;
//   // });
//   if (items.length > maxHistoryItems) {
//     // maxHistoryItems should be defined
//     const last = items[items.length - 1];
//     last.classList.add("fade-out"); // Requires CSS for fade-out animation
//     setTimeout(() => {
//       if (last.parentNode) last.parentNode.removeChild(last);
//     }, 300); // Match CSS animation time
//   }
// }
// const maxHistoryItems = 7; // Define if not already

// // HANDLER FOR MANUAL STOP (WIN)
// stopBtns.forEach((stopBtn, index) => {
//   stopBtn.addEventListener("click", async () => {
//     if (!isGameActive) return;

//     setGameActive(false); // Stop game mechanics and visuals
//     clearInterval(gameInterval);
//     console.log(
//       "Game stopped MANUALLY at coefficient:",
//       currentCoefficient.toFixed(2)
//     );

//     let betAmountForHistory = 0;
//     let gainAmount = 0; // For numerical bets, this is total payout. For gifts, net profit.
//     let isBetResolved = false;

//     if (currentBetType === "gift" && activeGiftBet) {
//       console.log("Gift bet WON:", activeGiftBet.name);
//       const winnings = activeGiftBet.price * currentCoefficient;
//       const netGainToBalance = winnings - activeGiftBet.price;
//       balance.value += netGainToBalance;
//       updateBalanceDisplay(); // Update visual balance
//       isBetResolved = true;
//       betAmountForHistory = activeGiftBet.price; // Original bet value
//       gainAmount = netGainToBalance; // Net profit for gift

//       // Return gift to inventory (SERVER CALL)
//       try {
//         const response = await fetch(
//           `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/inventory`,
//           {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               itemId: activeGiftBet.itemId,
//               count: 1,
//               isReturn: true,
//             }),
//           }
//         );
//         if (!response.ok) {
//           const errorData = await response.json();
//           alert(
//             `Не удалось вернуть подарок "${activeGiftBet.name}" в инвентарь: ${
//               errorData.error || "Ошибка сервера"
//             }`
//           );
//         } else {
//           console.log(
//             `Подарок "${activeGiftBet.name}" успешно возвращен в инвентарь.`
//           );
//           await renderMainInventory(telegramId); // Refresh inventory display
//         }
//       } catch (error) {
//         console.error("Ошибка при возврате подарка в инвентарь:", error);
//         alert("Ошибка связи при возврате подарка.");
//       }
//     } else if (currentBetType === "money") {
//       let totalNumericalBetValue = 0;
//       let totalNumericalPayout = 0;

//       fieldBet.forEach((f) => {
//         const numericalBetOnThisField = parseFloat(f.dataset.bet || "0");
//         if (numericalBetOnThisField > 0) {
//           isBetResolved = true;
//           totalNumericalBetValue += numericalBetOnThisField;
//           const payoutOnThisField =
//             numericalBetOnThisField * currentCoefficient;
//           balance.value += payoutOnThisField; // Balance was reduced by bet amount, now add full payout
//           totalNumericalPayout += payoutOnThisField;
//           console.log(
//             `Numerical bet of ${numericalBetOnThisField} WON. Payout: ${payoutOnThisField.toFixed(
//               2
//             )}`
//           );
//           f.dataset.bet = "0"; // Clear committed bet
//           // f.textContent = "0"; // balance.js event listener will clear this
//         }
//       });
//       if (isBetResolved) {
//         updateBalanceDisplay();
//         betAmountForHistory = totalNumericalBetValue;
//         gainAmount = totalNumericalPayout - totalNumericalBetValue; // Net profit for numerical bets
//       }
//     }

//     if (isBetResolved) {
//       addToHistory(currentCoefficient, false); // false for win (not crash) on coefficient bar
//       window.dispatchEvent(
//         new CustomEvent("betResult", {
//           detail: {
//             isWin: true,
//             coefficient: currentCoefficient,
//             betAmount: betAmountForHistory, // Original bet amount/price
//             gain: gainAmount, // Net gain for gift, or net gain for money
//             betType: currentBetType,
//             itemName: activeGiftBet ? activeGiftBet.name : null,
//             itemImage: activeGiftBet ? activeGiftBet.image : null,
//           },
//         })
//       );
//       if (telegramId) {
//         setBalanceToBd(Number(telegramId));
//       }
//     }

//     // Reset UI for next round (frog, line, coefficient display)
//     coefficientDisplay.style.opacity = "0";
//     if (progressLine) progressLine.style.opacity = "0";
//     if (frogGif) frogGif.style.opacity = "0";
//     // toggleButtons(); // Already called by setGameActive(false)
//     // fieldBet textContents and activeGiftBet are reset by balance.js's event listeners
//   });
// });

// // getUserName is in balance.js. The addBetToHistory here uses a local DOM query for username.
// // This addBetToHistory is for the localStorage-backed "all bets" list.
// export const addBetToHistory = async function (
//   betAmount,
//   coefficient,
//   isWin,
//   forTelegramId,
//   betType = "money",
//   itemName = null,
//   itemImage = null
// ) {
//   try {
//     const domUsername =
//       document.querySelector(".user-page-profile__name")?.textContent ||
//       "Игрок";
//     const username = domUsername; // Using DOM username for simplicity

//     const date = new Date().toISOString();
//     const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];
//     const newEntry = {
//       username: username,
//       bet: betAmount, // Original bet amount (gift price or money sum)
//       coefficient,
//       isWin,
//       date,
//       betType, // 'money' or 'gift'
//       itemName, // Name of the gift if it was a gift bet
//       itemImage, // Image of the gift
//     };

//     betHistory.push(newEntry);
//     localStorage.setItem("betHistory", JSON.stringify(betHistory));
//     addBetCards(); // This re-renders the list of all bets
//   } catch (err) {
//     console.error("Помилка при додаванні ставки в локальну історію:", err);
//   }
// };

// // Hook into 'betResult' to update localStorage history (THE "ALL BETS" LIST)
// window.addEventListener("betResult", (event) => {
//   const { isWin, coefficient, betAmount, gain, betType, itemName, itemImage } =
//     event.detail;
//   if (betAmount > 0) {
//     // Only log if there was an actual bet amount
//     addBetToHistory(
//       betAmount,
//       coefficient,
//       isWin,
//       telegramId,
//       betType,
//       itemName,
//       itemImage
//     );
//   }
// });

// function addBetCards() {
//   // Renders the "all bets" list from localStorage
//   const container = document.querySelector(".bet-count-list");
//   if (!container) return;

//   const betHistory = JSON.parse(localStorage.getItem("betHistory")) || [];
//   const betCount = document.querySelector("#total");
//   container.innerHTML = ""; // Clear container

//   betHistory
//     .slice()
//     .reverse()
//     .forEach((el) => {
//       // Show newest first
//       if (el && typeof el.bet === "number" && el.username) {
//         let betDisplay;
//         if (el.betType === "gift" && el.itemName) {
//           // For gifts, show gift image and its original price as the "bet"
//           betDisplay = `
//           <div class="bet-count-list__number gift-bet ${
//             el.isWin ? "win" : "lose"
//           }">
//             <img src="web/images/${
//               el.itemImage || "giveaway/gift/default.png"
//             }" alt="${el.itemName}" class="bet-count-list__gift-icon" title="${
//             el.itemName
//           }">
//             <span>${el.bet.toFixed(2)}</span>
//             <img src="web/images/main/ton-icon.svg" alt="TON" class="bet-count-list__diamond" />
//             (x${el.coefficient.toFixed(2)})
//           </div>`;
//         } else {
//           // Money bet
//           betDisplay = `
//           <div class="bet-count-list__number ${el.isWin ? "win" : "lose"}">
//             <span>${el.bet.toFixed(2)}</span>
//             <img src="web/images/main/ton-icon.svg" alt="TON" class="bet-count-list__diamond" />
//             (x${el.coefficient.toFixed(2)})
//           </div>`;
//         }

//         container.insertAdjacentHTML(
//           "beforeend",
//           `<li class="swiper-slide bet-count-list__item">
//           <div class="bet-count-list__profile">
//             <img src="web/images/profile/user-avatar.jpg" alt="user-avatar" class="bet-count-list__avatar" />
//             <h3 class="bet-count-list__username">${el.username}</h3>
//           </div>
//           ${betDisplay}
//         </li>`
//         );
//       }
//     });

//   if (betCount) {
//     betCount.textContent = container.children.length;
//   }
// }
// addBetCards(); // Initial render on load

// // The setInterval for toggling stop/select buttons was a bit redundant if setGameActive handles it.
// // Removed. toggleButtons is called by setGameActive.

// // Exports (ensure these are used or remove if not needed by other modules)
// // isGameActive is local, getIsGameActive is exported
// // startGame is called by balance.js
// // stopGame is called internally on crash
// // currentCoefficient is used internally, exported if other modules need it live.
// // addBetToHistory is for the "all bets" list, now correctly defined and used.
// export { getIsGameActive, startGame, stopGame, currentCoefficient };
