const addAdminInput = document.querySelector(".admin-add__input-add");
const addAdminBtn = document.querySelector(".admin-add__btn--add");
const removeAdminInput = document.querySelector(".admin-add__input--remove");
const removeAdminBtn = document.querySelector(".admin-add__btn--remove");
const openAdminPage = document.querySelector(".user-page-inv__btn--admin");
const adminSection = document.querySelector(".admin");
const updateUserBalanceBtn = document.querySelector(
  ".admin-balance__btn-update"
);
const updateUserBalanceId = document.querySelector(".admin-balance__input--id");
const updateUserBalanceSumma = document.querySelector(
  ".admin-balance__input--summa"
);
const addPromoInput = document.querySelector(".admin-promo__input--add");
const addPromoInputReward = document.querySelector(
  ".admin-promo__input--reward"
);
const addPromoBtn = document.querySelector(".admin-promo__btn--add");
const deletePromoInput = document.querySelector(".admin-promo__input--delete");
const deletePromoBtn = document.querySelector(".admin-promo__btn--delete");
const getPromoList = document.querySelector(".admin-promo__btn--get");

import { telegramId } from "./profile.js";

const isUserAdmin = async function (tgId) {
  try {
    const response = await fetch("https://nftbotserver.onrender.com/api/users");
    const users = await response.json();

    const user = users.find((user) => String(user.telegramId) === String(tgId));

    if (user && user.isAdmin) {
      return user;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Помилка при перевірці адміністратора:", err);
    return false;
  }
};

// Додати адміністратора
const addAdmins = async function (userId) {
  try {
    const response = await fetch("https://nftbotserver.onrender.com/api/users");
    if (!response.ok)
      throw new Error("Не удалось получить список пользователей");

    const users = await response.json();
    const user = users.find((u) => String(u.telegramId) === String(userId));

    if (!user) {
      return alert("Вы ввели неверный ID");
    }

    if (user.isAdmin) {
      return alert("Пользователь уже является администратором");
    }

    const updateRes = await fetch(
      `https://nftbotserver.onrender.com/api/users/${user.telegramId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: true }),
      }
    );

    if (updateRes.ok) {
      alert("Пользователь успешно назначен администратором");
    } else {
      alert("Ошибка при обновлении пользователя");
    }
  } catch (err) {
    console.error("Ошибка при добавлении администратора:", err);
  }
};

const removeAdmins = async function (userId) {
  try {
    const response = await fetch("https://nftbotserver.onrender.com/api/users");
    if (!response.ok)
      throw new Error("Не удалось получить список пользователей");

    const users = await response.json();
    const user = users.find((u) => String(u.telegramId) === String(userId));

    if (!user) {
      return alert("Вы ввели неверный ID");
    }

    if (!user.isAdmin) {
      return alert("Пользователь не является администратором");
    }

    const updateRes = await fetch(
      `https://nftbotserver.onrender.com/api/users/${user.telegramId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: false }),
      }
    );

    if (updateRes.ok) {
      alert("Пользователь успешно лишен прав администратора");
    } else {
      alert("Ошибка при обновлении пользователя");
    }
  } catch (err) {
    console.error("Ошибка при снятии администратора:", err);
  }
};
const updateUserBalance = async function (userId, balance) {
  try {
    const response = await fetch("https://nftbotserver.onrender.com/api/users");
    if (!response.ok)
      throw new Error("Не вдалося отримати список користувачів");

    const users = await response.json();
    const user = users.find((u) => String(u.telegramId) === String(userId));

    if (!user) {
      return alert("Вы ввели неверный ID");
    }

    if (balance >= 0) {
      const updateRes = await fetch(
        `https://nftbotserver.onrender.com/api/users/${user.telegramId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: balance }),
        }
      );

      if (updateRes.ok) {
        alert(`Баланс пользователя успешно обновлен на ${balance}`);
      } else {
        alert("Ошибка при изменение баланса");
      }
    } else {
      alert("Нельзя вводить отрицательный баланс");
    }
  } catch (err) {
    console.error("Ошибка при изменение баланса:", err);
  }
};
const addNewPromo = async function (promoCode, reward) {
  try {
    const response = await fetch(
      "https://nftbotserver.onrender.com/api/promocode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          reward,
          isActive: true,
        }),
      }
    );

    if (!response.ok) throw new Error("Не вдалося додати промокод");

    const newPromo = await response.json();
    alert(`✅ Промокод "${newPromo.code}" додано успішно!`);
  } catch (err) {
    console.error(err);
    alert("❌ Сталася помилка при додаванні промокоду!");
  }
};
const deletePromo = async function (promoCode) {
  try {
    const response = await fetch(
      `https://nftbotserver.onrender.com/api/promocode/${promoCode.toUpperCase()}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Не вдалося видалити промокод");
    }

    alert(`Промокод "${promoCode.toUpperCase()}" успішно видалено!`);
  } catch (err) {
    alert(`Помилка при видаленні промокоду: ${err.message}`);
  }
};

const showPromocodes = async function () {
  const promoContainer = document.querySelector(
    ".admin-promo-list__swiper-wrapper"
  );

  try {
    const response = await fetch(
      "https://nftbotserver.onrender.com/api/promocode"
    );
    if (!response.ok) throw new Error("Не вдалося отримати список промокодів");

    const promocodes = await response.json();

    if (!Array.isArray(promocodes) || promocodes.length === 0) {
      promoContainer.textContent = "❗️Промокоды отсутствуют.";
      return;
    }

    promoContainer.innerHTML = promocodes
      .map(
        (promo) => `
          <div class="swiper-slide admin-promo-list__card">
            <strong class="admin-promo-list__strong">${promo.code}</strong> : ${promo.reward}
            <img src="web/images/inventory/ton.svg" alt="ton" />
          </div>
        `
      )
      .join("");
  } catch (err) {
    console.error(err);
    promoContainer.textContent = "❌ Помилка при отриманні промокодів.";
  }
};

const showSection = function (targetSection) {
  document.querySelectorAll("section").forEach((section) => {
    section.style.display = "none";
  });
  targetSection.style.display = "block";
};
if (telegramId) {
  isUserAdmin(telegramId).then((user) => {
    if (user) {
      openAdminPage.style.display = "flex";
    } else {
      openAdminPage.style.display = "none";
    }
  });

  addAdminBtn.addEventListener("click", () => {
    const id = Number(addAdminInput.value.trim());
    if (!id) return alert("Введите корректный ID пользователя");
    addAdmins(id);
  });

  removeAdminBtn.addEventListener("click", () => {
    const id = Number(removeAdminInput.value.trim());
    if (!id) return alert("Введите корректный ID пользователя");
    removeAdmins(id);
  });

  addPromoBtn.addEventListener("click", () => {
    const promoName = addPromoInput.value.trim();
    const promoReward = Number(addPromoInputReward.value.trim());
    if (!promoName) return alert("Введите корректный промокод");

    addNewPromo(promoName, promoReward);
  });
  deletePromoBtn.addEventListener("click", () => {
    const promoCode = deletePromoInput.value.trim();
    if (!promoCode) return alert("Введите корректный промокод");
    deletePromo(promoCode);
  });

  updateUserBalanceBtn.addEventListener("click", () => {
    const id = Number(updateUserBalanceId.value.trim());
    const balance = Number(updateUserBalanceSumma.value.trim());
    if (!id) return alert("Введите корректный ID пользователя");
    updateUserBalance(id, balance);
  });
  getPromoList.addEventListener("click", () => {
    showPromocodes();
  });
} else {
  console.log("Не удалось получить Telegram ID");
}

// Клік по кнопці входу в адмінку
openAdminPage.addEventListener("click", () => {
  showSection(adminSection);
});

new Swiper(".admin-promo-list", {
  direction: "vertical",
  slidesPerView: 4,
  freeMode: true,
  mousewheel: true,
});
