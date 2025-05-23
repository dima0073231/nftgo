(async () => {
  const templates = document.querySelectorAll("template[load]");

  // Завантажуємо шаблони послідовно
  for (const el of templates) {
    const url = el.getAttribute("load");
    const res = await fetch(url);
    const html = await res.text();
    el.innerHTML = html;
    const clone = el.content.cloneNode(true);
    document.body.appendChild(clone);
  }

  const scripts = [
    "js/translation.js",
    "js/profile.js",
    "js/admin.js",
    "js/addUserBalance.js",
    "js/promocodes.js",
    "js/main.js",
    "js/ton.js",
    "js/balance.js",
    "js/inventory.js",
    "js/down-main.js",
    "js/buy-gift.js",
    "js/crash-game.js",
    "js/nav-bar.js",
    "js/frog-game.js",
    "js/giveaway.js",
    "js/friends.js",
  ];

  for (const src of scripts) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.type = "module";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
})();
