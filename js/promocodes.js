const promoBtnOpens = document.querySelectorAll(".promo-open-btn");
const promobackdrop = document.querySelector(".promo-backdrop");
const promoBtnClose = document.querySelector(".promo-modal__btn-close");
const promoInput = document.querySelector(".promo-modal__input");
const promoBtnSearchPromocode = document.getElementById(
  "promoModalSearchPromocode"
);
const inventorySection = document.querySelector(".user-page-inventory");
const userInv = document.querySelector(".user-page-inv");
const lockIcon = document.querySelector(".user-page-inv__icon--lock");
const iconInv = document.querySelector(".user-page-inv__icon--inv");

import { telegramId } from "./profile.js";

async function enterPromo(tgId, code) {
  try {
    const response = await fetch(
      "https://nftbotserver.onrender.com/api/promocode/activate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramId, code }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert(result.message || "Промокод применен!");
    } else {
      alert(result.error || "Не удалось применить промокод");
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка при подключении к серверу");
  }
}

if (lockIcon && inventorySection) {
  lockIcon.addEventListener("click", (e) => {
    e.preventDefault();
    userInv.classList.add("open");
    inventorySection.classList.add("open");
  });
}

if (promoBtnOpens) {
  promoBtnOpens.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (promobackdrop) promobackdrop.classList.remove("is-hidden");
    });
  });
}

if (promoBtnClose && promobackdrop) {
  promoBtnClose.addEventListener("click", () => {
    promobackdrop.classList.add("is-hidden");
  });
}

promoBtnSearchPromocode.addEventListener("click", () => {
  const inputValue = promoInput.value.trim();

  if (!inputValue) {
    alert("Пожалуйста, введите промокод");
    return;
  }

  enterPromo(telegramId, inputValue);
  promoInput.value = "";
});
