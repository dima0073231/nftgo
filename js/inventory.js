import { setBalanceToBd } from "./frog-game.js";
import { renderInventory } from "./buy-gift.js";
import { telegramId } from "./profile.js";
import { balance } from "./balance.js";

const sellBtns = document.querySelectorAll(".inventory-item__sell");

if (sellBtns.length > 0) {
  sellBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      await handleSellItem(this, telegramId);
    });
  });
}

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

    if (!balanceUpdated) {
      throw new Error("Не вдалося оновити баланс");
    }

    await renderInventory(userId);

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

    // setTimeout(() => item.remove(), 300);
  } catch (err) {
    console.error("Помилка при продажі:", err);
    alert("Помилка: " + err.message);
  }
}
