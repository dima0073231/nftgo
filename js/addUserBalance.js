const userBalance = document.querySelector(".main-balance");
import { telegramId } from "./profile.js";
const changeBalance = async function (userId) {
  try {
    const response = await fetch("https://nftbotserver.onrender.com/api/users");
    if (!response.ok)
      throw new Error("Не удалось получить список пользователей");

    const users = await response.json();
    const user = users.find((u) => String(u.telegramId) === String(userId));
    if (!user) throw new Error("Пользователь не найден");

    const balance = parseFloat(user.balance).toFixed(2);
    userBalance.innerHTML = `
      ${balance} +
      <img
        src="web/images/main/ton-icon.svg"
        alt="Token"
        class="main-balance__token"
      />
    `;
  } catch (err) {
    console.error("Ошибка при получении баланса:", err.message);
    userBalance.innerHTML = `
      0.00 +
      <img
        src="web/images/main/ton-icon.svg"
        alt="Token"
        class="main-balance__token"
      />
    `;
  }
};
export { changeBalance };
changeBalance();
