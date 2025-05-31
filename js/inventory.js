import { setBalanceToBd } from "./frog-game.js";
import { renderInventory } from "./buy-gift.js";
import { telegramId } from "./profile.js";
import { balance, renderMainInventory } from "./balance.js";

const sellBtns = document.querySelectorAll(".inventory-item__sell");

document.addEventListener("click", async function (e) {
  if (e.target.closest(".inventory-item__sell")) {
    const sellBtn = e.target.closest(".inventory-item__sell");
    await handleSellItem(sellBtn, telegramId);
  } else if (e.target.closest(".inventory-item__withdraw")) {
    const withdrawBtn = e.target.closest(".inventory-item__withdraw");
    await handleWithdrawItem(withdrawBtn, telegramId);
  }
});

async function handleSellItem(clickedBtn, userId) {
  const item = clickedBtn.closest(".inventory-item");
  if (!item) {
    console.error("Не вдалося знайти елемент інвентаря");
    return;
  }

  const priceElement = item.querySelector(".inventory-item__price");
  const nameElement = item.querySelector(".inventory-item__name");

  if (!priceElement || !nameElement) {
    console.error("Не вдалося знайти ціну або назву предмета");
    return;
  }

  const price = parseFloat(priceElement.textContent);
  const name = nameElement.textContent.trim();

  try {
    const response = await fetch(
      `https://nftbot-4yi9.onrender.com/api/users/${userId}/inventory/remove`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: name, countToRemove: 1 }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Не вдалося продати предмет");
    }

    balance.value += price;
    const balanceUpdated = await setBalanceToBd(userId);
    await renderMainInventory(userId);

    if (!balanceUpdated) {
      throw new Error("Не вдалося оновити баланс");
    }

    const itemsContainer = await renderInventory(userId);

    const balancePole = document.querySelector(".main-balance");
    if (balancePole) {
      balancePole.innerHTML = `
        ${balance.value.toFixed(2)}
        <img
          src="web/images/main/ton-icon.svg"
          alt="Token"
          class="main-balance__token"
        />
      `;
    }
  } catch (err) {
    console.error("Помилка при продажі:", err);
    alert("Помилка: " + err.message);
  }
}

async function handleWithdrawItem(clickedBtn, userId) {
  const item = clickedBtn.closest(".inventory-item");
  if (!item) {
    console.error("Не вдалося знайти елемент інвентаря");
    return;
  }

  const nameElement = item.querySelector(".inventory-item__name");

  if (!nameElement) {
    console.error("Не вдалося знайти назву предмета");
    return;
  }

  const name = nameElement.textContent.trim();

  try {
    const { exec } = require("child_process");
    exec(
      `python c:/Users/PIV/Desktop/StavkiNFT2.0/nftgo/python/sendGift.py ${userId} "${name}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Помилка виконання скрипта: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Помилка: ${stderr}`);
          return;
        }
        console.log(`Результат: ${stdout}`);
        alert("Подарунок успішно надіслано!");
      }
    );
  } catch (err) {
    console.error("Помилка при виведенні подарунка:", err);
    alert("Помилка: " + err.message);
  }
}
