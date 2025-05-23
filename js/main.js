const mainBlockRocket = document.querySelector(".main-block-rocket");
const rocketContent = document.querySelector(".rocket-content");
const mainFrog = document.querySelector(".main-frog");
const progressBar = document.querySelector(".progress-bar");

import { startGame, stopGame, getIsGameActive } from "./frog-game.js";

// Проверка, что элементы существуют
if (!rocketContent || !mainFrog || !progressBar) {
  console.error("Не все необходимые DOM элементы найдены");
}

// Стили для плавного перехода opacity
rocketContent.style.transition = "opacity 0.5s ease-in-out";

// Стили mainFrog
mainFrog.style.position = "absolute";
mainFrog.style.top = "0";
mainFrog.style.left = "0";
mainFrog.style.width = "100%";
mainFrog.style.height = "100%";
mainFrog.style.visibility = "hidden"; // Изначально скрыт
mainFrog.style.opacity = "0";
mainFrog.style.transition = "opacity 0.5s ease-in-out";

function showRocket() {
  mainFrog.style.opacity = "0";
  setTimeout(() => {
    mainFrog.style.visibility = "hidden";
    rocketContent.style.opacity = "1";
    resetProgressBar();
  }, 500); // ждём завершения transition
}

function showFrog() {
  rocketContent.style.opacity = "0";
  setTimeout(() => {
    mainFrog.style.visibility = "visible";
    mainFrog.style.opacity = "1";
    startGame();
  }, 500); // ждём завершения transition
}

function resetProgressBar() {
  // Сброс анимации — трюк с перезапуском
  progressBar.style.animation = "none";
  // Форсируем reflow, чтобы браузер применил изменение
  progressBar.offsetHeight;
  // Запускаем анимацию прогресс-бара
  progressBar.style.animation = "progressAnimation 5s linear forwards";
}

// Событие окончания анимации прогресс-бара
progressBar.addEventListener("animationend", () => {
  if (!getIsGameActive()) {
    showFrog();
  }
});

// Обработчик события игры «Crash»
document.addEventListener("gameCrash", () => {
  setTimeout(() => {
    showRocket();
    setTimeout(() => {
      resetProgressBar();
    }, 600);
  }, 2000);
});

const socket = new WebSocket("wss://web-socket-nftbot.onrender.com");

socket.addEventListener("message", (event) => {
  console.log("Получено сообщение:", event.data);
  try {
    const data = JSON.parse(event.data);
    const el = document.getElementById("onlineCount");
    if (el && data.online !== undefined) {
      el.textContent = data.online;
    } else {
      console.warn("Элемент для вывода не найден или данные невалидны");
    }
  } catch (error) {
    console.error("Ошибка парсинга JSON:", error);
  }
});

socket.addEventListener("error", (e) => {
  console.error("Ошибка WebSocket:", e);
});

socket.addEventListener("close", () => {
  console.log("WebSocket соединение закрыто");
});

