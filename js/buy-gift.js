const closeBtn = document.getElementById("closeGiftModalBtn");
const gridContainer = document.querySelector(".grid__wrapper");
const searchInput = document.getElementById("searchInput");
const buyBtn = document.getElementById("buyBtn");

const priceButtons = document.querySelectorAll(".price-options button");
const priceButtonOver = document.querySelector("price-options__btn");

const openModalBtns = document.querySelectorAll(
  ".inventory-skins-items-added-card"
);
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.querySelector(".close-btn");

let maxPrice = parseInt(
  document.querySelector(".price-options .active")?.dataset.price || "25"
);
import { telegramId } from "./profile.js";
import { changeBalance } from "./addUserBalance.js";
import { renderMainInventory } from "./balance.js";
let selectedItem = null;

const gifts = [
  { name: "Plush Pepe", price: 1210, image: "giveaway/gift/0.png" },
  {
    name: "Precious Peach",
    price: 137.5,
    image: "giveaway/gift/1.png",
  },
  {
    name: "Durov's Cap",
    price: 247.5,
    image: "giveaway/gift/2.png",
  },
  {
    name: "Diamond Ring",
    price: 10.23,
    image: "giveaway/gift/3.png",
  },
  {
    name: "Neko Helmet",
    price: 14.78,
    image: "giveaway/gift/4.png",
  },
  { name: "Loot Bag", price: 29.15, image: "giveaway/gift/5.png" },
  { name: "Love Potion", price: 6.56, image: "giveaway/gift/6.png" },
  { name: "Toy Bear", price: 15.4, image: "giveaway/gift/7.png" },
  {
    name: "Perfume Bottle",
    price: 46,
    image: "giveaway/gift/8.png",
  },
  {
    name: "Homemade Cake",
    price: 1.54,
    image: "giveaway/gift/9.png",
  },
  { name: "Mini Oscar", price: 47.2, image: "giveaway/gift/10.png" },
  { name: "Astral Shard", price: 44, image: "giveaway/gift/11.png" },
  { name: "Top Hat", price: 6.6, image: "giveaway/gift/12.png" },
  { name: "Genie Lamp", price: 23.1, image: "giveaway/gift/13.png" },
  {
    name: "B-Day Candle",
    price: 1.1,
    image: "giveaway/gift/14.png",
  },
  {
    name: "Jack-in-the-Box",
    price: 1.92,
    image: "giveaway/gift/15.png",
  },
  { name: "Snow Globe", price: 3.28, image: "giveaway/gift/16.png" },
  {
    name: "Swiss Watch",
    price: 20.9,
    image: "giveaway/gift/17.png",
  },
  {
    name: "Vintage Cigar",
    price: 21.4,
    image: "giveaway/gift/18.png",
  },
  {
    name: "Eternal Rose",
    price: 10.56,
    image: "giveaway/gift/19.png",
  },
  {
    name: "Love Candle",
    price: 7.15,
    image: "giveaway/gift/20.png",
  },
  { name: "Ion Gem", price: 43.89, image: "giveaway/gift/21.png" },
  {
    name: "Sharp Tongue",
    price: 18.689,
    image: "giveaway/gift/22.png",
  },
  { name: "Berry Box", price: 3.96, image: "giveaway/gift/23.png" },
  {
    name: "Bunny Muffin",
    price: 4.345,
    image: "giveaway/gift/24.png",
  },
  {
    name: "Hanging Star",
    price: 3.74,
    image: "giveaway/gift/25.png",
  },
  {
    name: "Record Player",
    price: 6.6,
    image: "giveaway/gift/26.png",
  },
  {
    name: "Scared Cat",
    price: 25.85,
    image: "giveaway/gift/27.png",
  },
  {
    name: "Kissed Frog",
    price: 15.4,
    image: "giveaway/gift/28.png",
  },
  {
    name: "Hypno Lollipop",
    price: 1.925,
    image: "giveaway/gift/29.png",
  },
  { name: "Lol Pop", price: 1.1, image: "giveaway/gift/30.png" },
  {
    name: "Ginger Cookie",
    price: 2.31,
    image: "giveaway/gift/31.png",
  },
  { name: "Evil Eye", price: 3.179, image: "giveaway/gift/32.png" },
  {
    name: "Signet Ring",
    price: 18.48,
    image: "giveaway/gift/33.png",
  },
  {
    name: "Desk Calendar",
    price: 1.1,
    image: "giveaway/gift/34.png",
  },
];

let giftsSwiper = null;

function initSwiper() {
  if (giftsSwiper) {
    giftsSwiper.destroy(true, true); // Додайте true, true для повного очищення
  }

  giftsSwiper = new Swiper(".grid", {
    direction: "vertical",
    freeMode: false,
    mousewheel: true,
    spaceBetween: 10,
    scrollbar: {
      el: ".buy-gift__swiper-scrollbar",
      draggable: true,
    },
    watchOverflow: true,
    breakpoints: {
      0: {
        slidesPerView: 2,
      },
      420: {
        slidesPerView: 3,
      },
    },
  });
}

function renderGifts(minPrice = 0, maxPrice = Infinity, searchQuery = "") {
  gridContainer.innerHTML = "";

  const filteredGifts = gifts.filter((gift) => {
    const priceMatch = gift.price >= minPrice && gift.price <= maxPrice;
    const nameMatch = gift.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return priceMatch && nameMatch;
  });

  if (filteredGifts.length === 0) {
    gridContainer.innerHTML = `
      <div class="no-gifts-message">
        Подарунків не знайдено. Спробуйте змінити критерії пошуку.
      </div>
    `;
    return;
  }

  filteredGifts.forEach((gift) => {
    const card = document.createElement("div");
    card.classList.add("gift-card");
    card.classList.add("swiper-slide");
    card.dataset.name = gift.name;
    card.dataset.price = gift.price;
    card.dataset.id = gift.id;

    card.innerHTML = `
      <div class="card-price">${gift.price} <img src="web/images/inventory/ton.svg" class="gem-icon"></div>
      <img class="card-price-icon-gift" src="web/images/${gift.image}" alt="${gift.name}" class="card-img">
      <div class="card-label">${gift.name}</div>
    `;

    card.addEventListener("click", () => {
      document
        .querySelectorAll(".gift-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedItem = gift;
    });

    gridContainer.appendChild(card);
  });

  if (giftsSwiper) {
    giftsSwiper.update();
    giftsSwiper.slideTo(0);
  }
  setTimeout(() => {
    initSwiper();
  }, 0);
}
renderGifts(0, Infinity);

const handleSearch = _.debounce(() => {
  const searchQuery = searchInput.value.trim();
  const activePriceBtn = document.querySelector(".price-options .active");

  const min = activePriceBtn ? parseFloat(activePriceBtn.dataset.min) : 0;
  const max = activePriceBtn
    ? parseFloat(activePriceBtn.dataset.max)
    : Infinity;

  renderGifts(min, max, searchQuery);
}, 300);

searchInput.addEventListener("input", handleSearch);

priceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    priceButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const min = parseFloat(button.dataset.min);
    const max = parseFloat(button.dataset.max);
    const searchQuery = searchInput.value.trim();

    renderGifts(min, max, searchQuery);
  });
});

renderGifts(0, Infinity);
// Покупка подарка
const addToInventory = async function (userId, itemId, count, price) {
  if (!selectedItem) {
    alert("Пожалуйста, выберите подарок!");
    return;
  }

  try {
    const updateRes = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: itemId,
          count: count,
          price: price,
        }),
      }
    );

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      throw new Error(errorData.error || "Не удалось обновить инвентарь");
    }

    const data = await updateRes.json();

    alert("Подарок успешно куплен!");
    await changeBalance(telegramId);
    modalOverlay.classList.add("is-hidden");
    renderInventory(userId);
    renderMainInventory(userId);
  } catch (err) {
    console.error("Ошибка:", err.message);
    alert("Ошибка при покупке: " + err.message);
  }
};

// Отображение инвентаря
async function renderInventory(userId) {
  const inventorySection = document.querySelector(".user-page-inventory");
  if (!inventorySection) return;

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory`
    );
    if (!response.ok) throw new Error("Не удалось получить инвентарь");

    const inventory = await response.json();

    // Якщо інвентар порожній — показати повідомлення і вийти
    if (!inventory.length) {
      inventorySection.querySelector(
        ".user-page-inventory__empty"
      ).style.display = "block";
      inventorySection.querySelector(
        ".inventory-items-container"
      ).style.display = "none";
      return;
    } else {
      inventorySection.querySelector(
        ".user-page-inventory__empty"
      ).style.display = "none";
      inventorySection.querySelector(
        ".inventory-items-container"
      ).style.display = "flex";
    }

    let itemsContainer = inventorySection.querySelector(
      ".inventory-items-container"
    );
    if (!itemsContainer) {
      itemsContainer = document.createElement("div");
      itemsContainer.className = "inventory-items-container";
      inventorySection.appendChild(itemsContainer);
    }

    itemsContainer.innerHTML = "";

    inventory.forEach((item) => {
      const gift = gifts.find((g) => g.name === item.itemId) || {
        name: item.itemId,
        image: "default-item.svg",
      };

      const itemElement = document.createElement("div");
      itemElement.classList.add('inventory-item');
      itemElement.classList.add('swiper-slide');

      itemElement.innerHTML = `
   
      <div class="inventory-item__wrapper flex">
        <span class="inventory-item__price">${gift.price}</span>
        <img src="web/images/${gift.image}" alt="${gift.name}" class="inventory-item__img">
      </div>
      <span class="inventory-item__name">${gift.name}</span>
      <div class="inventory-item__marketplace">
        <div class="inventory-item__cashout">
          <img src="web/images/inventory/download.svg" alt="download" width="25px" height="25px">
        </div>
        <div class="inventory-item__sell">
          <img src="web/images/inventory/basket.svg" alt="basket" width="30px" height="30px">
        </div>
      `;
      itemsContainer.appendChild(itemElement);
    });
  } catch (err) {
    console.error("Ошибка при загрузке инвентаря:", err);
  }
}
new Swiper(".inventory-swiper", {
  direction: "horizontal",
  slidesPerView: "auto",
  freeMode: true,
  mousewheel: true,
  spaceBetween: 10,
});

buyBtn.addEventListener("click", () => {
  if (!selectedItem) {
    alert("Сначала выбери подарок!");
    return;
  }
  addToInventory(telegramId, selectedItem.name, 1, selectedItem.price);
});

// Открытие/закрытие модалки
openModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modalOverlay.classList.remove("is-hidden");
    renderGifts(0, Infinity);
    initSwiper();
  });
});

closeModalBtn.addEventListener("click", () => {
  modalOverlay.classList.add("is-hidden");
});

closeBtn.addEventListener("click", () => {
  modalOverlay.classList.add("is-hidden");
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add("is-hidden");
  }
});

export { renderInventory, gifts };
// const inventorySkinsItems = document.querySelector(".inventory-skins-items");

// function renderGiftsMain(minPrice = 0, maxPrice = Infinity) {
//   inventorySkinsItems.innerHTML = "";

//   gifts
//     .filter((gift) => gift.price >= minPrice && gift.price <= maxPrice)
//     .forEach((gift) => {
//       const card = document.createElement("div");
//       card.classList.add("inventory-skins-items-card");
//       card.dataset.name = gift.name;
//       card.dataset.price = gift.price;
//       card.dataset.id = gift.id;

//       card.innerHTML = `
//         <div class="inventory-skins-items-card">
//           <div class="current">
//             <span class="inventory-skins-items-card__current">${gift.price}</span>
//             <img src="web/images/inventory/ton.svg" alt="ton" />
//           </div>
//           <img
//             src="web/images/${gift.image}"
//             alt="bottle"
//             class="inventory-skins-items-card__img"
//           />
//           <div class="inventory-item__cashout">
//             <img src="web/images/inventory/download.svg" alt="download" />
//           </div>
//           <h3 class="inventory-skins-items-card__title">${gift.name}</h3>
//         </div>
//       `;

//       const cashoutBtn = card.querySelector(".inventory-item__cashout");
//       cashoutBtn.addEventListener("click", (e) => {
//         e.stopPropagation();

//         if (getIsGameActive()) {
//           alert("Зачекайте завершення поточної гри!");
//           return;
//         }

//         const betValue = gift.price;

//         if (betValue > balance.value) {
//           alert("Недостатньо коштів на балансі!");
//           return;
//         }

//         balance.value -= betValue;
//         balancePole.innerHTML = `
//           ${balance.value.toFixed(2)}
//           <img
//             src="web/images/main/ton-icon.svg"
//             alt="Token"
//             class="main-balance__token"
//           />
//         `;

//         addBetToHistory(betValue);

//         fieldBet[0].textContent = betValue;
//         fieldBet[0].dataset.bet = betValue;

//         alert(`Ставка ${betValue} TON прийнята!`);
//       });

//       inventorySkinsItems.appendChild(card);
//     });
// }

// renderGiftsMain(0, Infinity);


// const giftImage = document.getElementById("giftImage");
// if (giftImage) {
//   addEventListener("click", async () => {
//     const giftId = "ID_ПОДАРКА_ТУТ";
//     const token = "ТВОЙ_JWT_ТОКЕН";

//     try {
//       const response = await fetch("http://localhost:3000/api/order/gift", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + token,
//         },
//         body: JSON.stringify({ id_winGift: giftId }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         alert(errorData.message || "Ошибка при заказе подарка");
//         return;
//       }

//       const data = await response.json();
//       alert(data.dataResults?.order || "Подарок успешно заказан!");
//     } catch (error) {
//       console.error("Ошибка запроса:", error);
//       alert("Ошибка при отправке запроса на сервер");
//     }
//   });
// }
