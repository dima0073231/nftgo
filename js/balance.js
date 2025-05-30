import { getIsGameActive } from "./frog-game.js";

const fixedBetBtns = document.querySelectorAll(".select-bet-change__btn");
const changeBetBtns = document.querySelectorAll(".select-bet-count__btn");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
const selectBetBtns = document.querySelectorAll(".select-bet__btn");
const balancePole = document.querySelector(".main-balance");
const stopBtns = document.querySelectorAll(".stop-btn");
const giftBetBtns = document.querySelectorAll(
  ".inventory-down-main-item__cashout"
);
import { telegramId } from "./profile.js";
import { addBetToHistory, currentCoefficient } from "./frog-game.js";
import { gifts } from "./buy-gift.js";

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
  value: parseFloat(balancePole.textContent),
};
getBalance(telegramId).then((bal) => {
  balance.value = bal || 0;
  // balancePole.textContent = balance.value.toFixed(2);
  balancePole.innerHTML = `
  ${balance.value.toFixed(2)} +
      <img
        src="web/images/main/ton-icon.svg"
        alt="Token"
        class="main-balance__token"
      />
  `;
});
let bet;

function updateButtonsState() {
  const gameActive = getIsGameActive();
  const hasGiftBet = !!localStorage.getItem("activeGiftBet");

  fixedBetBtns.forEach((btn) => (btn.disabled = gameActive || hasGiftBet));
  changeBetBtns.forEach((btn) => (btn.disabled = gameActive || hasGiftBet));
  selectBetBtns.forEach((btn) => (btn.disabled = gameActive || hasGiftBet));

  // Блокуємо кнопки подарунків під час звичайної ставки
  giftBetBtns.forEach((btn) => {
    btn.disabled =
      gameActive ||
      fieldValues.some((f) => parseFloat(f.dataset.bet || "0") > 0);
  });
}
setInterval(updateButtonsState, 100);

stopBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (getIsGameActive()) return;
    fieldBet.forEach((field) => (field.textContent = "0"));
  });
});

function changeBet(field, fixedBtns, changeBtns, selectBtn) {
  let currentOperation = "";
  let currentValue = Number(field.textContent) || 0;

  // Обработка кнопок плюс/минус
  changeBtns.forEach((el) => {
    el.addEventListener("click", () => {
      if (getIsGameActive()) return;
      currentOperation = el.id; // например "plus" или "minus"
      console.log("Текущая операция:", currentOperation);
    });
  });

  selectBtn.addEventListener("click", () => {
    if (getIsGameActive()) return;

    if (currentValue === 0) {
      alert("Сделайте ставку");
      field.textContent = "0";
      bet = 0;
    } else if (currentValue <= balance.value) {
      bet = currentValue;
      balance.value -= bet;
      addBetToHistory(bet);
      balancePole.innerHTML = `
      ${balance.value.toFixed(2)}
      <img
        src="web/images/main/ton-icon.svg"
        alt="Token"
        class="main-balance__token"
      />
    `;
      alert("Ставка сделана");
      field.dataset.bet = bet;
      field.textContent = "0";
      currentValue = 0;
      bet = 0;
      window.dispatchEvent(
        new CustomEvent("newBet", { detail: { amount: bet } })
      );
    } else {
      alert("Недостаточно средств на балансе");
      field.textContent = "0";
      currentValue = 0;
      bet = 0;
    }
  });

  // Обработка фиксированных кнопок изменения ставки
  fixedBtns.forEach((el) => {
    el.addEventListener("click", () => {
      if (getIsGameActive()) return;
      const num = Number(el.textContent);
      if (currentOperation === "plus") {
        currentValue += num;
      } else if (currentOperation === "minus" && currentValue >= num) {
        currentValue -= num;
      }
      field.textContent = currentValue;
    });
  });
}

// Разбиваем кнопки на две группы и связываем с соответствующими полями
const firstFixedHalf = Array.from(fixedBetBtns).slice(0, 5);
const firstChangedHalf = Array.from(changeBetBtns).slice(0, 2);
const firstSelectBtn = selectBetBtns[0];

const secondFixedHalf = Array.from(fixedBetBtns).slice(5);
const secondChangedHalf = Array.from(changeBetBtns).slice(2);
const secondSelectBtn = selectBetBtns[1];

let fieldValues = [];

fieldBet.forEach((field, index) => {
  if (index === 0) {
    changeBet(field, firstFixedHalf, firstChangedHalf, firstSelectBtn);
  } else if (index === 1) {
    changeBet(field, secondFixedHalf, secondChangedHalf, secondSelectBtn);
  }
  fieldValues.push(field);
});

async function renderMainInventory(userId) {
  // const inventorySection = document.querySelector(".user-page-inventory");
  // if (!inventorySection) return;

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`
    );
    if (!response.ok) throw new Error("Не удалось получить инвентарь");

    const inventory = await response.json();

    if (!inventory.length) {
      return;
    }
    let itemsContainer = document.querySelector(".inventory-skins-items");
    // if (!itemsContainer) {
    //   itemsContainer = document.createElement("div");
    //   itemsContainer.className = "inventory-skins-items";
    //   inventorySection.appendChild(itemsContainer);
    // }

    itemsContainer.innerHTML = "";

    inventory.forEach((item) => {
      const gift = gifts.find((g) => g.name === item.itemId);

      const itemElement = document.createElement("div");
      itemElement.classList.add("inventory-skins-items-card");
      itemElement.classList.add("swiper-slide");

      itemElement.innerHTML = `
            <div class="current">
              <span class="inventory-skins-items-card__current">${gift.price}</span>
              <img src="web/images/inventory/ton.svg" alt="ton" />
            </div>
            <img
              src="web/images/${gift.image}"
              alt="bottle"
              class="inventory-skins-items-card__img"
            />
            <h3 class="inventory-skins-items-card__title">${gift.name} x${item.count}</h3>
            <button type="button" class="inventory-item__cashout inventory-down-main-item__cashout">
              Ставить
            </button>
      `;
      itemsContainer.appendChild(itemElement);
    });
  } catch (err) {
    console.error("Ошибка при загрузке инвентаря:", err);
  }
}
renderMainInventory(telegramId);
export { changeBet, fieldValues, balance, bet, renderMainInventory };

// Инициализация слайдера Swiper
new Swiper(".bet-count__swiper", {
  direction: "vertical",
  slidesPerView: "auto",
  freeMode: true,
  mousewheel: true,
});
new Swiper(".down-main-inventory__swiper", {
  direction: "horizontal",
  slidesPerView: 1,
  freeMode: true,
  mousewheel: true,
});
