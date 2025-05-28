import { bet, renderMainInventory } from "./balance.js";
import { changeBet } from "./balance.js";
import { telegramId } from "./profile.js";
const toggleButtons = document.querySelectorAll(".bal-inv__btn");
const betToggle = document.querySelector(".bet-Toggle");
const giftCard = document.querySelectorAll(".select-bet-change__btn");
const betContainer = document.querySelector(".bet-count-list");
const userNames = document.querySelector(".user-page-profile__name");
const userProfImg = document.querySelector(".user-page-profile__avatar");
const totalBet = document.getElementById("total");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
const betBtn = document.querySelectorAll(".select-bet__btn");
const toggleInvBtn = document.querySelector(".bal-inv__btn--inventory");

console.log(betToggle);

if (betToggle) {
  betToggle.addEventListener("click", (event) => {
    if (!event.target.classList.contains("bal-inv__btn")) {
      return;
    }

    toggleButtons.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    const target = event.target.dataset.target;

    const switcherBlocks = document.querySelectorAll(".sw");

    switcherBlocks.forEach((block) => {
      block.classList.remove("active");
      if (block.classList.contains(`bet-switcher__${target}`)) {
        block.classList.add("active");
      }
    });
  });
} else {
  console.warn("Элемент .bet-toggle не найден");
}
toggleInvBtn.addEventListener("click", () => {
  renderMainInventory(telegramId);
});

betBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const betValue = Number(fieldBet[index].textContent);
    const userName = userNames.textContent.trim();
    const userAvatar = userProfImg.src;

    if (bet) {
      betContainer.innerHTML += `
       <li class="swiper-slide bet-count-list__item">
        <div class="bet-count-list__profile">
          <img src="${userAvatar}" class="bet-count-list__avatar" alt="avatar">
          <h3 class="bet-count-list__username">${userName}</h3>
        </div>
        <div class="bet-count-list__number">
          <span class="count">${bet}</span>
          <img src="web/images/main/ton-icon.svg" alt="diamond" class="bet-count-list__diamond" />
        </div>
      </li>
    `;
    }

    const total = document.querySelectorAll(".bet-count-list__item").length;
    totalBet.textContent = total;
  });
});

giftCard.forEach((e) => {
  e.addEventListener("click", () => {
    betContainer.innerHTML += `
    <li class="swiper-slide bet-count-list__item">
            <div class="bet-count-list__profile">
            <img src="${userProfImg.src}" class="bet-count-list__avatar" alt="avatar">
              <h3 class="bet-count-list__username">${userNames.textContent}</h3>
            </div>
            <div class="bet-count-list__number">
            <span class="count">${betValue}</span>

              <img
                src="web/images/main/ton-icon.svg"
                alt="diamond"
                class="bet-count-list__diamond"
              />
            </div>
          </li>
    `;

    const currentCount = betContainer.querySelectorAll(
      ".bet-count-list__item"
    ).length;
    totalBet.textContent = currentCount;
  });
});
// import { bet, renderMainInventory } from "./balance.js"; // bet is tricky, renderMainInventory is fine
// import { renderMainInventory, balanceTelegramId as telegramId } from "./balance.js"; // Use aliased telegramId
// // import { changeBet } from "./balance.js"; // changeBet is internal to balance.js setup
// // import { telegramId } from "./profile.js"; // Use the one from balance.js to avoid conflicts

// const toggleButtons = document.querySelectorAll(".bal-inv__btn");
// const betToggle = document.querySelector(".bet-Toggle"); // Element that contains toggleButtons
// // const giftCard = document.querySelectorAll(".select-bet-change__btn"); // These are for numerical bets
// const betContainer = document.querySelector(".bet-count-list"); // This is the "ALL BETS" list, updated by frog-game.js
// const userNames = document.querySelector(".user-page-profile__name");
// const userProfImg = document.querySelector(".user-page-profile__avatar");
// const totalBet = document.getElementById("total"); // Count for "ALL BETS" list
// // const fieldBet = document.querySelectorAll(".select-bet-count__number"); // Not directly used here
// // const betBtn = document.querySelectorAll(".select-bet__btn"); // "Start Game" buttons, not for this list
// const toggleInvBtn = document.querySelector(".bal-inv__btn--inventory");

// // console.log(betToggle); // Keep for debugging if needed

// if (betToggle) {
//   betToggle.addEventListener("click", (event) => {
//     const clickedButton = event.target.closest(".bal-inv__btn"); // Ensure click is on a button or its child
//     if (!clickedButton) {
//       return;
//     }

//     toggleButtons.forEach((btn) => btn.classList.remove("active"));
//     clickedButton.classList.add("active");

//     const target = clickedButton.dataset.target;
//     const switcherBlocks = document.querySelectorAll(".sw"); // Assuming .sw is the class for switchable content blocks

//     switcherBlocks.forEach((block) => {
//       block.classList.remove("active");
//       if (block.classList.contains(`bet-switcher__${target}`)) {
//         block.classList.add("active");
//       }
//     });
//   });
// } else {
//   console.warn("Элемент .bet-toggle не найден");
// }

// if (toggleInvBtn) {
//     toggleInvBtn.addEventListener("click", () => {
//         if (telegramId) {
//             renderMainInventory(telegramId);
//         }
//     });
// }


// // The "bet list" (betContainer) is now populated by frog-game.js's addBetCards,
// // which listens to the "betResult" event after a game round.
// // The "newBetPlaced" event from balance.js can be used if you want to show
// // bets *as they are placed* before the game starts, in a *different* list or UI element.
// // The current `betContainer` seems to be for historical bets.

// // If `betContainer` is meant for bets *currently in play for this round*:
// window.addEventListener('newBetPlaced', (event) => {
//   // This event fires when a bet (money or gift) is confirmed and game is about to start.
//   // The `bet-count-list` (.betContainer) is for historical bets from `addBetCards`.
//   // If you need a separate list for "current round bets", create a new container and logic here.
//   // For now, let's assume `betContainer` is correctly handled by `frog-game.js` for past bets.

//   const { amount, type, itemName, itemImage } = event.detail;
//   console.log('A new bet was placed:', { amount, type, itemName });
//   // Example: update a specific UI element showing "Current Bet: ..."
//   const currentBetDisplay = document.getElementById('current-active-bet-display'); // Hypothetical element
//   if (currentBetDisplay) {
//       if (type === 'gift') {
//           currentBetDisplay.innerHTML = `Ставка: <img src="web/images/${itemImage}" class="current-bet-gift-icon" alt="${itemName}"> ${itemName} (${amount.toFixed(2)})`;
//       } else {
//           currentBetDisplay.innerHTML = `Ставка: ${amount.toFixed(2)} <img src="web/images/main/ton-icon.svg" alt="TON" class="bet-count-list__diamond" />`;
//       }
//   }
// });

// // Clear the current bet display when game ends (crash or manual stop)
// window.addEventListener('gameCrash', clearCurrentBetDisplay);
// window.addEventListener('betResult', clearCurrentBetDisplay); // Catches manual stop wins too

// function clearCurrentBetDisplay() {
//     const currentBetDisplay = document.getElementById('current-active-bet-display');
//     if (currentBetDisplay) {
//         currentBetDisplay.innerHTML = "Делайте вашу ставку!";
//     }
// }

// // The old betBtn.forEach and giftCard.forEach listeners that manually added to betContainer
// // are removed as that list is now data-driven from game results via frog-game.js.