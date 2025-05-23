import { getIsGameActive } from "./frog-game.js";

const fixedBetBtns = document.querySelectorAll(".select-bet-change__btn");
const changeBetBtns = document.querySelectorAll(".select-bet-count__btn");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
const selectBetBtns = document.querySelectorAll(".select-bet__btn");
const balancePole = document.querySelector(".main-balance");
const stopBtns = document.querySelectorAll(".stop-btn");
import { telegramId } from "./profile.js";
// import { addBetToHistory } from "./frog-game.js";

// const getUserName = async function (userId) {
//   try {
//     const response = await fetch("https://nftbotserver.onrender.com/api/users");
//     if (!response.ok) throw new Error("Ошибка сети");

//     const users = await response.json();
//     const user = users.find((user) => user.telegramId == userId);

//     if (user) {
//       return user.username;
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };
// export { getUserName };
const getBalance = async function (tgId) {
  try {
    const response = await fetch(`https://nftbotserver.onrender.com/api/users`);
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

// Экспортируем необходимые переменные и функции
export { changeBet, fieldValues, balance, bet };

// Инициализация слайдера Swiper
new Swiper(".bet-count__swiper", {
  direction: "vertical",
  slidesPerView: "auto",
  freeMode: true,
  mousewheel: true,
});
