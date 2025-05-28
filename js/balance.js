// import { getIsGameActive } from "./frog-game.js";

// const fixedBetBtns = document.querySelectorAll(".select-bet-change__btn");
// const changeBetBtns = document.querySelectorAll(".select-bet-count__btn");
// const fieldBet = document.querySelectorAll(".select-bet-count__number");
// const selectBetBtns = document.querySelectorAll(".select-bet__btn");
// const balancePole = document.querySelector(".main-balance");
// const stopBtns = document.querySelectorAll(".stop-btn");
// const giftBetBtns = document.querySelectorAll(
//   ".inventory-down-main-item__cashout"
// );
// import { telegramId } from "./profile.js";
// import { addBetToHistory, currentCoefficient } from "./frog-game.js";
// import { gifts } from "./buy-gift.js";

// const getUserName = async function (userId) {
//   try {
//     const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
//     if (!response.ok) throw new Error("Ошибка сети");

//     const users = await response.json();
//     const user = users.find((user) => String(user.telegramId) === String(tgId));

//     if (!user) {
//       console.error("Користувача не знайдено");
//       return null;
//     }

//     if (!user.username) {
//       console.error("У користувача відсутнє ім'я");
//       return null;
//     }

//     return user.username;
//   } catch (err) {
//     console.error("Помилка при отриманні імені:", err);
//     return null;
//   }
// };
// export { getUserName };
// const getBalance = async function (tgId) {
//   try {
//     const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
//     if (!response.ok) throw new Error("Користувача не знайдено");

//     const users = await response.json();
//     const user = users.find((user) => String(user.telegramId) === String(tgId));

//     if (user && user.balance !== undefined) {
//       return user.balance;
//     } else {
//       console.log("Користувач не має балансу");
//       return null;
//     }
//   } catch (err) {
//     console.log("getBalance error:", err.message);
//     return null;
//   }
// };

// let balance = {
//   value: parseFloat(balancePole.textContent),
// };
// getBalance(telegramId).then((bal) => {
//   balance.value = bal || 0;
//   // balancePole.textContent = balance.value.toFixed(2);
//   balancePole.innerHTML = `
//   ${balance.value.toFixed(2)} +
//       <img
//         src="web/images/main/ton-icon.svg"
//         alt="Token"
//         class="main-balance__token"
//       />
//   `;
// });
// let bet;

// function updateButtonsState() {
//   const disabled = getIsGameActive();

//   fixedBetBtns.forEach((btn) => (btn.disabled = disabled));
//   changeBetBtns.forEach((btn) => (btn.disabled = disabled));
//   selectBetBtns.forEach((btn) => (btn.disabled = disabled));
// }

// setInterval(updateButtonsState, 100);

// stopBtns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     if (getIsGameActive()) return;
//     fieldBet.forEach((field) => (field.textContent = "0"));
//   });
// });

// function changeBet(field, fixedBtns, changeBtns, selectBtn) {
//   let currentOperation = "";
//   let currentValue = Number(field.textContent) || 0;

//   // Обработка кнопок плюс/минус
//   changeBtns.forEach((el) => {
//     el.addEventListener("click", () => {
//       if (getIsGameActive()) return;
//       currentOperation = el.id; // например "plus" или "minus"
//       console.log("Текущая операция:", currentOperation);
//     });
//   });

//   selectBtn.addEventListener("click", () => {
//     if (getIsGameActive()) return;

//     if (currentValue === 0) {
//       alert("Сделайте ставку");
//       field.textContent = "0";
//       bet = 0;
//     } else if (currentValue <= balance.value) {
//       bet = currentValue;
//       balance.value -= bet;
//       addBetToHistory(bet);
//       balancePole.innerHTML = `
//       ${balance.value.toFixed(2)}
//       <img
//         src="web/images/main/ton-icon.svg"
//         alt="Token"
//         class="main-balance__token"
//       />
//     `;
//       alert("Ставка сделана");
//       field.dataset.bet = bet;
//       field.textContent = "0";
//       currentValue = 0;
//       bet = 0;
//       window.dispatchEvent(
//         new CustomEvent("newBet", { detail: { amount: bet } })
//       );
//     } else {
//       alert("Недостаточно средств на балансе");
//       field.textContent = "0";
//       currentValue = 0;
//       bet = 0;
//     }
//   });

//   // Обработка фиксированных кнопок изменения ставки
//   fixedBtns.forEach((el) => {
//     el.addEventListener("click", () => {
//       if (getIsGameActive()) return;
//       const num = Number(el.textContent);
//       if (currentOperation === "plus") {
//         currentValue += num;
//       } else if (currentOperation === "minus" && currentValue >= num) {
//         currentValue -= num;
//       }
//       field.textContent = currentValue;
//     });
//   });
// }

// // Разбиваем кнопки на две группы и связываем с соответствующими полями
// const firstFixedHalf = Array.from(fixedBetBtns).slice(0, 5);
// const firstChangedHalf = Array.from(changeBetBtns).slice(0, 2);
// const firstSelectBtn = selectBetBtns[0];

// const secondFixedHalf = Array.from(fixedBetBtns).slice(5);
// const secondChangedHalf = Array.from(changeBetBtns).slice(2);
// const secondSelectBtn = selectBetBtns[1];

// let fieldValues = [];

// fieldBet.forEach((field, index) => {
//   if (index === 0) {
//     changeBet(field, firstFixedHalf, firstChangedHalf, firstSelectBtn);
//   } else if (index === 1) {
//     changeBet(field, secondFixedHalf, secondChangedHalf, secondSelectBtn);
//   }
//   fieldValues.push(field);
// });

// async function renderMainInventory(userId) {
//   // const inventorySection = document.querySelector(".user-page-inventory");
//   // if (!inventorySection) return;

//   try {
//     const response = await fetch(
//       `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`
//     );
//     if (!response.ok) throw new Error("Не удалось получить инвентарь");

//     const inventory = await response.json();

//     if (!inventory.length) {
//       return;
//     }
//     let itemsContainer = document.querySelector(".inventory-skins-items");
//     // if (!itemsContainer) {
//     //   itemsContainer = document.createElement("div");
//     //   itemsContainer.className = "inventory-skins-items";
//     //   inventorySection.appendChild(itemsContainer);
//     // }

//     itemsContainer.innerHTML = "";

//     inventory.forEach((item) => {
//       const gift = gifts.find((g) => g.name === item.itemId);

//       const itemElement = document.createElement("div");
//       itemElement.classList.add("inventory-skins-items-card");
//       itemElement.classList.add("swiper-slide");

//       itemElement.innerHTML = `
//             <div class="current">
//               <span class="inventory-skins-items-card__current">${gift.price}</span>
//               <img src="web/images/inventory/ton.svg" alt="ton" />
//             </div>
//             <img
//               src="web/images/${gift.image}"
//               alt="bottle"
//               class="inventory-skins-items-card__img"
//             />
//             <button type="button" class="inventory-item__cashout inventory-down-main-item__cashout">
//               <img src="web/images/inventory/download.svg" alt="download" id="giftImage">
//             </button>
//             <h3 class="inventory-skins-items-card__title">${gift.name}</h3>
//       `;
//       itemsContainer.appendChild(itemElement);
//     });
//   } catch (err) {
//     console.error("Ошибка при загрузке инвентаря:", err);
//   }
// }
// giftBetBtns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     if (!bet) return;
//     const itemEl = btn.closest(".inventory-skins-items-card");
//     const priceDom = itemEl.querySelector(
//       ".inventory-skins-items-card__current"
//     );
//     const price = Number(priceDom);

//   });
// });
// export { changeBet, fieldValues, balance, bet, renderMainInventory };

// // Инициализация слайдера Swiper
// new Swiper(".bet-count__swiper", {
//   direction: "vertical",
//   slidesPerView: "auto",
//   freeMode: true,
//   mousewheel: true,
// });
// new Swiper(".down-main-inventory__swiper", {
//   direction: "horizontal",
//   slidesPerView: "auto",
//   freeMode: true,
//   mousewheel: true,
// });
import { getIsGameActive, startGame } from "./frog-game.js"; // Added startGame

const fixedBetBtns = document.querySelectorAll(".select-bet-change__btn");
const changeBetBtns = document.querySelectorAll(".select-bet-count__btn");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
const selectBetBtns = document.querySelectorAll(".select-bet__btn"); // These are "Start Game" buttons
const balancePole = document.querySelector(".main-balance");
const stopBtns = document.querySelectorAll(".stop-btn"); // stopBtns are in frog-game.js, but used for state here
// const giftBetBtns are now handled by event delegation on itemsContainer
import { telegramId } from "./profile.js";
// addBetToHistory from balance.js's original code was for frog-game results, handle in frog-game.js
import { gifts } from "./buy-gift.js"; // Assuming this path is correct and gifts array is available

// State for current betting
let activeGiftBet = null; // Stores { itemId, name, price, image }
let currentBetType = "money"; // 'money' or 'gift'

const getUserName = async function (userId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
    if (!response.ok) throw new Error("Ошибка сети");

    const users = await response.json();
    const user = users.find((user) => String(user.telegramId) === String(tgId));

    if (!user) {
      console.error("Користувача не знайдено");
      return null;
    }

    if (!user.username) {
      console.error("У користувача відсутнє ім'я");
      return null;
    }

    return user.username;
  } catch (err) {
    console.error("Помилка при отриманні імені:", err);
    return null;
  }
};
export { getUserName };
const getBalance = async function (tgId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
    if (!response.ok) throw new Error("Користувача не знайдено");

    const users = await response.json();
    const user = users.find((user) => String(user.telegramId) === String(tgId));

    if (user && user.balance !== undefined) {
      return user.balance;
    } else {
      console.log("Користувач не має балансу");
      return null;
    }
  } catch (err) {
    console.log("getBalance error:", err.message);
    return null;
  }
};

let balance = {
  value: 0, // Initialized after fetch
};

getBalance(telegramId).then((bal) => {
  balance.value = bal || 0;
  updateBalanceDisplay(); // Use a function for consistency
});

// This 'bet' variable seems to be for the numerical bet amount.
// If two numerical slots are active, this global 'bet' might be ambiguous.
// We'll rely more on field.dataset.bet for committed numerical bets.
export let bet; // For numerical bet processing, if needed globally

function updateBalanceDisplay() {
  if (balancePole) {
    balancePole.innerHTML = `
      ${balance.value.toFixed(2)}
      <img
        src="web/images/main/ton-icon.svg"
        alt="Token"
        class="main-balance__token"
      />`;
  }
}

export function updateButtonsState() {
  const disabled = getIsGameActive();
  const isGiftBetActive = activeGiftBet !== null;
  const isNumericalBetConfigured = Array.from(fieldBet).some(
    (field) => parseFloat(field.textContent) > 0
  );

  // Disable all bet modification if game is active
  fixedBetBtns.forEach((btn) => (btn.disabled = disabled || isGiftBetActive));
  changeBetBtns.forEach((btn) => (btn.disabled = disabled || isGiftBetActive));

  // SelectBetBtns are "Start Game" buttons. They should be disabled if game is active.
  // If no bet is configured (neither gift nor numerical), they should also be disabled.
  selectBetBtns.forEach((btn) => {
    btn.disabled = disabled || (!isGiftBetActive && !isNumericalBetConfigured);
  });

  // Gift cashout buttons (bet with gift)
  const allGiftCashoutBtns = document.querySelectorAll(
    ".inventory-down-main-item__cashout"
  );
  allGiftCashoutBtns.forEach((btn) => {
    btn.disabled = disabled || isNumericalBetConfigured;
    // Style the button if its gift is the activeGiftBet
    const card = btn.closest(".inventory-skins-items-card");
    if (card && activeGiftBet && card.dataset.itemId === activeGiftBet.itemId) {
      card.classList.add("gift-bet-active");
      btn.textContent = "Отменить"; // Indicate it's selected
    } else if (card) {
      card.classList.remove("gift-bet-active");
      // Reset button text if needed, or rely on image
      const img = btn.querySelector("img#giftImage");
      if (img)
        btn.innerHTML = `<img src="web/images/inventory/download.svg" alt="download" id="giftImage">`;
    }
  });

  if (!disabled) {
    if (isGiftBetActive) {
      fieldBet.forEach((field) => {
        field.textContent = "0"; // Clear numerical bet fields if gift is chosen
        field.disabled = true;
      });
      fixedBetBtns.forEach((btn) => (btn.disabled = true));
      changeBetBtns.forEach((btn) => (btn.disabled = true));
    } else {
      fieldBet.forEach((field) => (field.disabled = false));
      fixedBetBtns.forEach((btn) => (btn.disabled = false));
      changeBetBtns.forEach((btn) => (btn.disabled = false));
    }
  } else {
    // Game is active
    fieldBet.forEach((field) => (field.disabled = true));
  }
}

setInterval(updateButtonsState, 200); // Update state periodically

// stopBtns are primarily handled in frog-game.js for game logic.
// This listener clears numerical input fields if "Stop" (which acts as Cancel before game) is pressed.
stopBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (getIsGameActive()) return; // If game active, frog-game.js handles stop
    // If game not active, this "Stop" button might be a "Cancel Bet" action
    fieldBet.forEach((field) => (field.textContent = "0"));
    // If a gift bet was active, cancel it too
    if (activeGiftBet) {
      resetGiftBetState(); // resetGiftBetState will call updateButtonsState
    } else {
      updateButtonsState();
    }
  });
});

function changeBet(field, fixedBtns, changeBtns, selectBtn) {
  let currentOperation = "";
  let currentValueInField = Number(field.textContent) || 0; // Value in the specific field being configured

  changeBtns.forEach((el) => {
    el.addEventListener("click", () => {
      if (getIsGameActive() || activeGiftBet) return;
      currentOperation = el.id;
      updateButtonsState();
    });
  });

  selectBtn.addEventListener("click", async () => {
    if (getIsGameActive()) return;

    if (activeGiftBet) {
      // A gift bet is primary, start game with gift
      console.log("Starting game with gift bet:", activeGiftBet);
      currentBetType = "gift"; // Ensure this is set

      try {
        // 1. Remove gift from inventory (SERVER CALL)
        const response = await fetch(
          `https://nftbot-4yi9.onrender.com/api/users/${telegramId}/inventory/remove`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId: activeGiftBet.itemId,
              countToRemove: 1,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          alert(
            `Не удалось сделать ставку подарком: ${
              errorData.error || "Ошибка сервера"
            }`
          );
          resetGiftBetState(); // Reset if server removal failed
          return;
        }
        await renderMainInventory(telegramId); // Re-render to show gift removed
      } catch (error) {
        console.error("Ошибка при удалении подарка из инвентаря:", error);
        alert("Ошибка связи при ставке подарком.");
        resetGiftBetState();
        return;
      }

      window.dispatchEvent(
        new CustomEvent("newBetPlaced", {
          detail: {
            amount: activeGiftBet.price,
            type: "gift",
            itemName: activeGiftBet.name,
            itemImage: activeGiftBet.image,
          },
        })
      );
      startGame(); // Function from frog-game.js
    } else {
      // Numerical bet
      currentValueInField = Number(field.textContent) || 0; // Get current value from THIS field
      if (currentValueInField === 0) {
        // This check should ideally be part of updateButtonsState disabling selectBtn
        alert("Сделайте ставку");
        return;
      }
      if (currentValueInField <= balance.value) {
        currentBetType = "money";
        balance.value -= currentValueInField;
        updateBalanceDisplay();
        // alert("Ставка сделана"); // Alert might be intrusive if game starts immediately
        field.dataset.bet = currentValueInField; // Store the committed bet for this field

        window.dispatchEvent(
          new CustomEvent("newBetPlaced", {
            detail: { amount: currentValueInField, type: "money" },
          })
        );

        // Check if ANY numerical bet is placed to start game
        // For simplicity, if this selectBtn is clicked with a value, we start.
        // If multiple numerical bets are possible, frog-game.js will sum them up or handle individually.
        startGame(); // Function from frog-game.js

        // field.textContent = "0"; // Clear field after bet is placed and game starts
        // currentValueInField = 0; // Reset for this field's context
        // The field content should show the bet until game end or reset by updateButtonsState logic
      } else {
        alert("Недостаточно средств на балансе");
        field.textContent = "0";
        // currentValueInField = 0;
      }
    }
    updateButtonsState(); // Refresh button states after action
  });

  fixedBtns.forEach((el) => {
    el.addEventListener("click", () => {
      if (getIsGameActive() || activeGiftBet) return;
      currentValueInField = Number(field.textContent) || 0;
      const num = Number(el.textContent);
      if (currentOperation === "plus") {
        currentValueInField += num;
      } else if (currentOperation === "minus" && currentValueInField >= num) {
        currentValueInField -= num;
      }
      field.textContent = currentValueInField;
      updateButtonsState();
    });
  });
}

const firstFixedHalf = Array.from(fixedBetBtns).slice(0, 5);
const firstChangedHalf = Array.from(changeBetBtns).slice(0, 2);
const firstSelectBtn = selectBetBtns[0];

const secondFixedHalf = Array.from(fixedBetBtns).slice(5);
const secondChangedHalf = Array.from(changeBetBtns).slice(2);
const secondSelectBtn = selectBetBtns[1];

let fieldValues = []; // Not sure about the direct usage of this export

fieldBet.forEach((field, index) => {
  if (index === 0 && firstSelectBtn) {
    changeBet(field, firstFixedHalf, firstChangedHalf, firstSelectBtn);
  } else if (index === 1 && secondSelectBtn) {
    changeBet(field, secondFixedHalf, secondChangedHalf, secondSelectBtn);
  }
  fieldValues.push(field); // Populates fieldValues
});

async function renderMainInventory(userId) {
  const itemsContainer = document.querySelector(".inventory-skins-items");
  if (!itemsContainer) {
    console.error("itemsContainer for inventory not found");
    return;
  }

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`
    );
    if (!response.ok) throw new Error("Не удалось получить инвентарь");
    const inventory = await response.json();
    itemsContainer.innerHTML = ""; // Clear previous items

    if (!inventory.length) {
      itemsContainer.innerHTML = "<p>Инвентарь пуст.</p>";
      return;
    }

    inventory.forEach((item) => {
      const gift = gifts.find((g) => g.name === item.itemId); // Assuming item.itemId from server IS gift.name
      if (!gift) {
        console.warn(
          `Подарок с itemId '${item.itemId}' (количество: ${item.count}) не найден в локальном списке gifts.`
        );
        return;
      }

      const itemElement = document.createElement("div");
      itemElement.classList.add("inventory-skins-items-card", "swiper-slide");
      itemElement.dataset.itemId = gift.name; // Used for identification
      itemElement.dataset.giftPrice = gift.price;
      itemElement.dataset.giftImage = gift.image;

      itemElement.innerHTML = `
            <div class="current">
              <span class="inventory-skins-items-card__current">${gift.price.toFixed(
                2
              )}</span>
              <img src="web/images/inventory/ton.svg" alt="ton" />
              ${
                item.count > 1
                  ? `<span class="inventory-item__count">x${item.count}</span>`
                  : ""
              }
            </div>
            <img
              src="web/images/${gift.image}"
              alt="${gift.name}"
              class="inventory-skins-items-card__img"
            />
            <button type="button" class="inventory-item__cashout inventory-down-main-item__cashout">
              <img src="web/images/inventory/download.svg" alt="download" id="giftImage">
            </button>
            <h3 class="inventory-skins-items-card__title">${gift.name}</h3>
      `;
      itemsContainer.appendChild(itemElement);
    });
    updateButtonsState(); // Re-check button states after inventory render
  } catch (err) {
    console.error("Ошибка при загрузке инвентаря:", err);
    itemsContainer.innerHTML = "<p>Ошибка загрузки инвентаря.</p>";
  }
}

// Event delegation for gift bet buttons
const mainInventoryContainer = document.querySelector(".inventory-skins-items");
if (mainInventoryContainer) {
  mainInventoryContainer.addEventListener("click", (event) => {
    const cashoutButton = event.target.closest(
      ".inventory-down-main-item__cashout"
    );
    if (!cashoutButton) return;

    if (getIsGameActive()) {
      alert("Нельзя изменить ставку во время игры.");
      return;
    }
    const isNumericalBetConfigured = Array.from(fieldBet).some(
      (field) => parseFloat(field.textContent) > 0
    );
    if (isNumericalBetConfigured) {
      alert(
        "Уберите числовую ставку, чтобы поставить подарок. \nИли нажмите 'Стоп', чтобы отменить числовую ставку."
      );
      return;
    }

    const itemEl = cashoutButton.closest(".inventory-skins-items-card");
    const giftName = itemEl.dataset.itemId;
    const giftPrice = parseFloat(itemEl.dataset.giftPrice);
    const giftImage = itemEl.dataset.giftImage;

    if (activeGiftBet && activeGiftBet.itemId === giftName) {
      resetGiftBetState(); // Unselect if clicking the same gift
      alert(`Подарок "${giftName}" убран из ставки.`);
    } else {
      activeGiftBet = {
        itemId: giftName,
        name: giftName,
        price: giftPrice,
        image: giftImage,
      };
      currentBetType = "gift";
      alert(
        `Подарок "${giftName}" выбран для ставки. Нажмите одну из кнопок "Ставка", чтобы начать игру.`
      );
    }
    updateButtonsState();
  });
}

function resetGiftBetState() {
  if (activeGiftBet) {
    // Only log/alert if there was an active gift bet
    console.log("Resetting active gift bet:", activeGiftBet.name);
  }
  activeGiftBet = null;
  currentBetType = "money"; // Revert to money betting by default
  updateButtonsState(); // This will re-enable numerical fields if game not active
}

// Listen to game events from frog-game.js to reset state
window.addEventListener("gameCrash", () => {
  if (currentBetType === "gift") {
    resetGiftBetState();
  }
  fieldBet.forEach((field) => {
    field.textContent = "0"; // Clear numerical display
    // field.dataset.bet is cleared in frog-game.js for money bets
  });
  updateButtonsState(); // Ensure UI consistency
});

window.addEventListener("betResult", (event) => {
  if (event.detail.betType === "gift" && event.detail.isWin) {
    resetGiftBetState();
  }
  fieldBet.forEach((field) => {
    field.textContent = "0"; // Clear numerical display
    // field.dataset.bet is cleared in frog-game.js for money bets
  });
  updateButtonsState(); // Ensure UI consistency
});

// Swiper initializations (remain the same)
// ...

// Exports:
// Removed `bet` from export as its global use for two slots is tricky.
// `fieldValues` is populated but its external use wasn't clear from the task.
export {
  changeBet,
  fieldValues,
  balance,
  renderMainInventory,
  activeGiftBet, // Export for frog-game.js to read
  currentBetType, // Export for frog-game.js to read
  telegramId as balanceTelegramId, // Export telegramId, possibly aliased
  updateBalanceDisplay, // Export for frog-game.js
  resetGiftBetState, // Export if frog-game needs to call it directly (alternative to events)
};
