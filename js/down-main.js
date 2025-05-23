import { bet } from "./balance.js";
import { changeBet } from "./balance.js";
const toggleButtons = document.querySelectorAll(".bal-inv__btn");
const betToggle = document.querySelector(".bet-Toggle");
const giftCard = document.querySelectorAll(".select-bet-change__btn");
const betContainer = document.querySelector(".bet-count-list");
const userNames = document.querySelector(".user-page-profile__name");
const userProfImg = document.querySelector(".user-page-profile__avatar");
const totalBet = document.getElementById("total");
const fieldBet = document.querySelectorAll(".select-bet-count__number");
const betBtn = document.querySelectorAll(".select-bet__btn");

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

// giftCard.forEach((e) => {
//   e.addEventListener('click', () => {
//     betContainer.innerHTML += `
//     <li class="swiper-slide bet-count-list__item">
//             <div class="bet-count-list__profile">
//             <img src="${userProfImg.src}" class="bet-count-list__avatar" alt="avatar">
//               <h3 class="bet-count-list__username">${userNames.textContent}</h3>
//             </div>
//             <div class="bet-count-list__number">
//             <span class="count">${betValue}</span>

//               <img
//                 src="web/images/main/ton-icon.svg"
//                 alt="diamond"
//                 class="bet-count-list__diamond"
//               />
//             </div>
//           </li>
//     `

//     const currentCount = betContainer.querySelectorAll('.bet-count-list__item').length;
//     totalBet.textContent = currentCount
//   })
// })
