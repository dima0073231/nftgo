const navItems = document.querySelectorAll(".icon-navigation-bar .nav-item");
const iconNavigationBar = document.querySelector(".icon-navigation-bar");
const sections = document.querySelectorAll("section");


function setActiveItem(clickedItem) {
  navItems.forEach(item => item.classList.remove("active-item"));
  clickedItem.classList.add("active-item");

  if (clickedItem.id === "frog") {
    iconNavigationBar.classList.remove("purple-theme");
  } else {
    iconNavigationBar.classList.add("purple-theme");
  }
}

function hideAllSections() {
  sections.forEach(section => (section.style.display = "none"));
}

function showSectionsBySelectors(selectors) {
  selectors.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      if (selector === "#friends") {
        el.style.display = "flex";
      } else {
        el.style.display = "block";
      }
    }
  });
}

navItems.forEach(item => {
  item.addEventListener("click", event => {
    const targetId = event.currentTarget.id;
    console.log(targetId, event.currentTarget);

    hideAllSections();

    switch (targetId) {
      case "profile":
        showSectionsBySelectors([".user-page"]);
        break;
      case "frog":
        showSectionsBySelectors([".main-rocket", ".down-main"]);
        break;
      case "gifts":
        showSectionsBySelectors([".giveaway"]);
        break;
      case "bonus":
        showSectionsBySelectors(["#friends"]);
        break;
      default:
        break;
    }

    setActiveItem(event.currentTarget);
  });
});

const profileInvBtn = document.querySelector(".user-page-inventory__empty-btn");
if (profileInvBtn) {
  profileInvBtn.addEventListener("click", () => {
    hideAllSections();
    showSectionsBySelectors([".main-rocket", ".down-main"]);

    navItems.forEach(item => item.classList.remove("active-item"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!iconNavigationBar) return;

  const initiallyActiveItem = iconNavigationBar.querySelector(".nav-item.active-item");

  if (initiallyActiveItem && initiallyActiveItem.id === "frog") {
    iconNavigationBar.classList.remove("purple-theme");
  } else {
    iconNavigationBar.classList.add("purple-theme");
  }
});

