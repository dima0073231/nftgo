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
import { gifts } from "./buy-gift.js";
import {
  getIsGameActive,
  startGame,
  currentBetType,
  currentGiftBet,
  cashoutGiftBet,
} from "./frog-game.js";

const getUserName = async function (userId) {
  try {
    const response = await fetch("https://nftbot-4yi9.onrender.com/api/users");
    if (!response.ok) throw new Error("Ошибка сети");

    const users = await response.json();
    const user = users.find(
      (user) => String(user.telegramId) === String(userId)
    );

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
  const disabled = getIsGameActive();

  fixedBetBtns.forEach((btn) => (btn.disabled = disabled));
  changeBetBtns.forEach((btn) => (btn.disabled = disabled));
  selectBetBtns.forEach((btn) => (btn.disabled = disabled));
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
      // addBetToHistory(bet);
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
async function removeGiftFromInventory(userId, itemId, count = 1) {
  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory/remove`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, countToRemove: count }),
      }
    );

    if (!response.ok) throw new Error("Помилка при видаленні подарунка");
    return await response.json();
  } catch (err) {
    console.error("removeGiftFromInventory error:", err);
    return null;
  }
}

async function addGiftToInventory(userId, itemId, count = 1) {
  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          count,
          price: gifts.find((g) => g.name === itemId)?.price || 0,
        }),
      }
    );

    if (!response.ok) throw new Error("Помилка при додаванні подарунка");
    return await response.json();
  } catch (err) {
    console.error("addGiftToInventory error:", err);
    return null;
  }
}
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
  <button type="button" class="inventory-item__cashout inventory-down-main-item__cashout" 
    data-item-id="${gift.name}" data-item-price="${gift.price}">
    <img src="web/images/inventory/download.svg" alt="download">
  </button>
  <h3 class="inventory-skins-items-card__title">${gift.name} x${item.count}</h3>
`;
      itemsContainer.appendChild(itemElement);
    });
  } catch (err) {
    console.error("Ошибка при загрузке инвентаря:", err);
  }
}
function setupGiftBetHandlers() {
  document.addEventListener("click", async (e) => {
    const cashoutBtn = e.target.closest(".inventory-down-main-item__cashout");
    if (!cashoutBtn) return;

    console.log("Клік на кнопку ставки подарунком виявлено");

    if (getIsGameActive()) {
      alert("Зачекайте завершення поточної гри");
      return;
    }

    const card = cashoutBtn.closest(".inventory-skins-items-card");
    if (!card) {
      console.error("Не знайдено картку подарунка");
      return;
    }

    const titleElement = card.querySelector(
      ".inventory-skins-items-card__title"
    );
    if (!titleElement) {
      console.error("Не знайдено заголовок подарунка");
      return;
    }

    const titleText = titleElement.textContent.trim();
    const [itemName, itemCountStr] = titleText.split(" x");
    const itemCount = parseInt(itemCountStr) || 1;

    console.log(`Знайдено подарунок: ${itemName}, кількість: ${itemCount}`);

    const gift = gifts.find((g) => g.name === itemName);
    if (!gift) {
      console.error("Подарунок не знайдено:", itemName);
      alert("Помилка: подарунок не знайдено");
      return;
    }

    if (itemCount < 1) {
      alert("Недостатньо подарунків для ставки");
      return;
    }

    const confirmBet = confirm(
      `Ви дійсно хочете зробити ставку подарунком "${itemName}"?`
    );
    if (!confirmBet) return;

    try {
      console.log(`Спроба видалити подарунок ${itemName} з інвентаря`);
      const removed = await removeGiftFromInventory(telegramId, itemName, 1);

      if (!removed) {
        throw new Error("Не вдалося видалити подарунок");
      }

      // Оновлюємо інвентар перед початком гри
      await renderMainInventory(telegramId);

      // Встановлюємо ставку подарунком
      currentBetType = "gift";
      currentGiftBet = {
        itemId: itemName,
        count: 1,
        price: gift.price,
      };

      // Запускаємо гру
      startGame();

      alert(`Ставка подарунком "${itemName}" прийнята! Гра почалась...`);
    } catch (err) {
      console.error("Помилка при ставці подарунком:", err);
      alert("Сталася помилка при обробці ставки");

      // Спроба повернути подарунок, якщо щось пішло не так
      try {
        await addGiftToInventory(telegramId, itemName, 1);
        await renderMainInventory(telegramId);
      } catch (restoreErr) {
        console.error("Помилка при відновленні подарунка:", restoreErr);
      }

      currentGiftBet = null;
      currentBetType = "money";
    }
  });
}
setupGiftBetHandlers();
if (telegramId) {
  renderMainInventory(telegramId);
}
export {
  changeBet,
  fieldValues,
  balance,
  bet,
  renderMainInventory,
  addGiftToInventory,
};

// Инициализация слайдера Swiper
new Swiper(".bet-count__swiper", {
  direction: "vertical",
  slidesPerView: "auto",
  freeMode: true,
  mousewheel: true,
});
new Swiper(".down-main-inventory__swiper", {
  direction: "horizontal",
  slidesPerView: "auto",
  freeMode: true,
  mousewheel: true,
});
