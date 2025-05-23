const langButtons = document.querySelectorAll(".user-page-change-language__btn");
    const profileIdElement = document.querySelector(".user-page-profile__id");

    const translations = {
        ru: {
            inventory: "Инвентарь",
            activatePromo: "Активировать промокод",
            selectLanguage: "Выбрать язык",
            russian: "Русский",
            english: "English",
            gameHistory: "История игр",
            userIdPrefix: "User ID: ",
            gameCardWalletPrefix: "Telegram Wallet",
            promoMef: "Вы получили 2 кг мефедрона",
            promoTon: "Вы получили 100 ton на баланс",
            promoInsult: "Иди нахуй",
            promoInvalid: "Промокод не действителен харе вводить на рандом",
            newsTitle: "Наши новости",
            newsButtonOpen: "Открыть",
            rocketStatusText: '<span class="main-block-rocket-text__span">ОЖИДАНИЕ</span><br />СЛЕДУЮЩЕГО РАУНДА',
            connectWallet: "Подключить кошелек",
            pingError: "❌ Элемент .main-network-status__span не найден!",
            betTitle: "Выбрать тип ставки",
            betTypeBalance: "Баланс",
            betTypeInventory: "Инвентарь",
            placeBetButton: "Ставить",
            totalBetsPrefix: "Всего ставок: ",
            modalTitleBuyGift: "Купить подарок",
            modalSearchPlaceholder: "🔍 Название",
            modalMaxPriceLabel: "Макс. цена TON",
            modalBuyButton: "Купить предметы",
            inventorySkinsTitle: "Выбрать скины",
            inventoryBuyGift: "купить подарок",
            friendsPromoBannerTitle: "Получи 10% от<br />депозита вашего друга",
            friendsInviteButton: "Пригласить друга",
            friendsCopyNotification: "Ссылка скопирована",
            friendsReferralBalanceLabel: "Реферальный баланс",
            friendsWithdrawButton: "Вывести",
            friendsBonusBalanceTitle: "Заработай бонусный баланс",
            friendsInviteXFriendsTaskPlaceholder: "Пригласи {count} друзей", // Kept for potential generic use
            friendsInviteXFriendsTask: "Пригласи 40 друзей", // Old generic task, might be unused or used elsewhere
            // New specific task translations
            friendsInvite10Task: "Пригласи 10 друзей",
            friendsInvite25Task: "Пригласи 25 друзей",
            friendsInvite50Task: "Пригласи 50 друзей",
            friendsInvite100Task: "Пригласи 100 друзей",
            friendsInvitedHeaderPrefix: "Приглашено ({count})",
            friendsInvitedColumnUser: "Пользователь",
            friendsInvitedColumnProfit: "Прибыль",
            friendsNoInvitedYet: "Вы еще не пригласили друзей",
            pageTitleGifts: "Магазин подарков",
            giftsOpenShopButton: "Открыть магазин",
            giveawayTitle: "Розыгрыш",
            giveawaySubscriptionContest: "Конкурс подписок",
            giveawayMagicPotions: "Магические зелья",
            giveawayConditions: "Условия",
            giveawayTimeLeftPlaceholder: "{days} дней {time}",
            giveawayDayUnit: "дней",
            giveawaySubscribePrefix: "Подписаться:",
            giveawayParticipants: "Участники",
            giveawayParticipateButton: "Участвовать",
            giveawayLastWinners: "Последние победители",
            navTop: "Топ",
            navBonus: "Бонус",
            navPlay: "Играть",
            navProfile: "Профиль",
            navGifts: "Подарки",
            promoModalTitle: "Введите промокод",
            promoModalInputPlaceholder: "Введите промо-код...",
            promoModalConfirmButton: "Подтвердить",
            takeBetButton: 'Забрать выигрыш',
            userPageInventoryText: 'Упс! Видимо, вы еще не играли',
        },
        en: {
            inventory: "Inventory",
            activatePromo: "Activate promocode",
            selectLanguage: "Select language",
            russian: "Русский",
            english: "English",
            gameHistory: "Game History",
            userIdPrefix: "User ID: ",
            gameCardWalletPrefix: "Telegram Wallet",
            promoMef: "You received 2 kg of mephedrone",
            promoTon: "You received 100 ton to your balance",
            promoInsult: "Go f*ck yourself",
            promoInvalid: "Promocode is not valid. Stop entering random codes.",
            newsTitle: "Check our news",
            newsButtonOpen: "Open",
            rocketStatusText: '<span class="main-block-rocket-text__span">WAITING FOR</span><br />NEXT ROUND',
            connectWallet: "Connect Wallet",
            pingError: "❌ Element .main-network-status__span not found!",
            betTitle: "Select bet type",
            betTypeBalance: "Balance",
            betTypeInventory: "Inventory",
            placeBetButton: "Place Bet",
            totalBetsPrefix: "Total bets: ",
            modalTitleBuyGift: "Buy a gift",
            modalSearchPlaceholder: "🔍 Name",
            modalMaxPriceLabel: "Max. price TON",
            modalBuyButton: "BUY ITEMS",
            inventorySkinsTitle: "Select skins",
            inventoryBuyGift: "buy a gift",
            friendsPromoBannerTitle: "Get 10% of<br />your friend's deposit",
            friendsInviteButton: "Invite a friend",
            friendsCopyNotification: "Link copied",
            friendsReferralBalanceLabel: "Referral balance",
            friendsWithdrawButton: "Withdraw",
            friendsBonusBalanceTitle: "Earn bonus balance",
            friendsInviteXFriendsTaskPlaceholder: "Invite {count} friends", // Kept for potential generic use
            friendsInviteXFriendsTask: "Invite 40 friends", // Old generic task, might be unused or used elsewhere
            // New specific task translations
            friendsInvite10Task: "Invite 10 friends",
            friendsInvite25Task: "Invite 25 friends",
            friendsInvite50Task: "Invite 50 friends",
            friendsInvite100Task: "Invite 100 friends",
            friendsInvitedHeaderPrefix: "Invited ({count})",
            friendsInvitedColumnUser: "User",
            friendsInvitedColumnProfit: "Profit",
            friendsNoInvitedYet: "You haven't invited any friends yet",
            pageTitleGifts: "Gift Shop",
            giftsOpenShopButton: "Open Shop",
            giveawayTitle: "Giveaway",
            giveawaySubscriptionContest: "Subscription Contest",
            giveawayMagicPotions: "Magic potions",
            giveawayConditions: "Conditions",
            giveawayTimeLeftPlaceholder: "{days} days {time}",
            giveawayDayUnit: "days",
            giveawaySubscribePrefix: "Subscribe:",
            giveawayParticipants: "Participants",
            giveawayParticipateButton: "Participate",
            giveawayLastWinners: "Last winners",
            navTop: "Top",
            navBonus: "Bonus",
            navPlay: "Play",
            navProfile: "Profile",
            navGifts: "Gifts",
            promoModalTitle: "Enter promotional code",
            promoModalInputPlaceholder: "Enter promo-code...",
            promoModalConfirmButton: "Confirm",
            takeBetButton: 'Collect winnings',
            userPageInventoryText: 'Oops! Looks like you have not played yet',
        },
    };

    let currentLanguage = localStorage.getItem("miniAppLanguage") || "ru";

    function setLanguage(lang) {
        if (!translations[lang]) {
            console.error(`Language ${lang} not found in translations.`);
            return;
        }
        currentLanguage = lang;
        localStorage.setItem("miniAppLanguage", currentLanguage);
        document.documentElement.lang = currentLanguage === 'ru' ? 'ru' : 'en';


        document.querySelectorAll("[data-lang-key]").forEach((element) => {
            const key = element.dataset.langKey;
            if (translations[currentLanguage][key]) {
                if ((element.classList.contains('bet-count__title') || element.classList.contains('inventory-bid__title')) && key === 'totalBetsPrefix') {
                    const numberSpan = element.querySelector('#total, .inventory-bid__title-num');
                    element.childNodes[0].nodeValue = translations[currentLanguage][key];
                } else if (key === 'friendsInvitedHeaderPrefix') {
                    const currentText = element.textContent;
                    const countMatch = currentText.match(/\((\d+)\)/);
                    const count = countMatch ? countMatch[1] : '0';
                    element.textContent = translations[currentLanguage][key].replace('{count}', count);
                } else if (key === 'friendsInviteXFriendsTask') { // This handles the old generic "Invite 40 friends" if still used
                    const currentText = element.textContent;
                    const countMatch = currentText.match(/(\d+)/);
                    if (countMatch) {
                        const count = countMatch[1];
                        element.textContent = translations[currentLanguage].friendsInviteXFriendsTaskPlaceholder.replace('{count}', count);
                    } else {
                         element.textContent = translations[currentLanguage][key];
                    }
                } else if (key === 'giveawayTimeLeftPlaceholder') {
                    const currentText = element.textContent;
                    const parts = currentText.split(" ");
                    if (parts.length >= 2) {
                        const dayOrNum = parts[0];
                        const timeOrUnit = parts.length > 2 ? parts[2] : parts[1];
                        const dayUnit = translations[currentLanguage].giveawayDayUnit || (currentLanguage === 'ru' ? 'дней' : 'days');

                        element.textContent = translations[currentLanguage][key]
                            .replace("{days}", dayOrNum)
                            .replace("{time}", timeOrUnit);
                    } else {
                         element.textContent = translations[currentLanguage][key];
                    }
                } else if (key === 'giveawaySubscribePrefix') {
                    const spanElement = element.querySelector('span');
                    element.childNodes[0].nodeValue = translations[currentLanguage][key];
                    if (spanElement) {
                         element.appendChild(spanElement);
                    }
                }
                 else if (element.tagName === 'BUTTON' && element.childNodes.length > 0) {
                    let textNodeFound = false;
                    for (let i = 0; i < element.childNodes.length; i++) {
                        if (element.childNodes[i].nodeType === Node.TEXT_NODE && element.childNodes[i].textContent.trim() !== '') {
                            if(element.childNodes[i].previousSibling && element.childNodes[i].previousSibling.nodeName === "IMG"){
                                element.childNodes[i].textContent = " " + translations[currentLanguage][key];
                            } else {
                                element.childNodes[i].textContent = translations[currentLanguage][key];
                            }
                            textNodeFound = true;
                            break;
                        }
                    }
                    if (!textNodeFound) {
                         const textChild = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
                         if (textChild) {
                            if(textChild.previousSibling && textChild.previousSibling.nodeName === "IMG"){
                                textChild.textContent = " " + translations[currentLanguage][key];
                            } else {
                                textChild.textContent = translations[currentLanguage][key];
                            }
                         } else {
                            let hasIcon = false;
                            for(let i=0; i < element.childNodes.length; i++){
                                if(element.childNodes[i].nodeName === "IMG"){
                                    hasIcon = true;
                                    break;
                                }
                            }
                            if(hasIcon && !element.textContent.trim()){
                                const textNode = document.createTextNode(" " + translations[currentLanguage][key]);
                                element.appendChild(textNode);
                            } else if (element.tagName === 'TITLE') {
                                element.textContent = translations[currentLanguage][key];
                            }
                             else {
                                element.textContent = translations[currentLanguage][key];
                            }
                         }
                    }
                } else { // This general case will now handle the new specific task keys
                     element.textContent = translations[currentLanguage][key];
                }
            }
        });

        document.querySelectorAll("[data-lang-html-key]").forEach((element) => {
            const key = element.dataset.langHtmlKey;
            if (translations[currentLanguage][key]) {
                element.innerHTML = translations[currentLanguage][key];
            }
        });

        document.querySelectorAll("[data-lang-placeholder-key]").forEach((element) => {
            const key = element.dataset.langPlaceholderKey;
            if (translations[currentLanguage][key]) {
                element.placeholder = translations[currentLanguage][key];
            }
        });

        if (profileIdElement) {
            const currentText = profileIdElement.textContent;
            const idNumberMatch = currentText.match(/:\s*([\d.]+)$/);
            const idNumber = idNumberMatch ? idNumberMatch[1] : (currentText.split(':')[1] ? currentText.split(':')[1].trim() : '');
            profileIdElement.textContent = translations[currentLanguage].userIdPrefix + idNumber;
        }

        document.querySelectorAll("[data-game-card-text]").forEach(cardTextEl => {
            const fullText = cardTextEl.textContent.trim();
            const previousLang = currentLanguage === 'ru' ? 'en' : 'ru';
            const previousPrefix = translations[previousLang]?.gameCardWalletPrefix || "Telegram Wallet";

            let datePart = fullText;
            if (fullText.startsWith(previousPrefix)) {
                datePart = fullText.substring(previousPrefix.length).trim();
            } else if (fullText.startsWith(translations[currentLanguage].gameCardWalletPrefix)) {
                datePart = fullText.substring(translations[currentLanguage].gameCardWalletPrefix.length).trim();
            }
            cardTextEl.textContent = `${translations[currentLanguage].gameCardWalletPrefix} ${datePart}`;
        });

        if (langButtons.length > 0) {
            langButtons.forEach((button) => {
                if (button.dataset.lang === currentLanguage) {
                    button.classList.add("active");
                } else {
                    button.classList.remove("active");
                }
            });
        }
    }

    if (langButtons.length > 0) {
        langButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const lang = button.dataset.lang;
                if (lang) {
                    setLanguage(lang);
                }
            });
        });
    }

    setLanguage(currentLanguage);

    window.appTranslations = translations;
    window.getCurrentAppLanguage = () => currentLanguage;
    window.updateDynamicText = (elementSelector, langKeyOrPrefix, dynamicValue, options = {}) => {
        const element = document.querySelector(elementSelector);
        if (!element || !translations[currentLanguage]) return;

        const { isPlaceholderLogic = false, placeholderValues = {}, targetChildSelector = null } = options;

        let textContent;
        let targetElement = element;

        if(targetChildSelector){
            const child = element.querySelector(targetChildSelector);
            if(child) targetElement = child;
        }

        if (isPlaceholderLogic && translations[currentLanguage][langKeyOrPrefix]) {
            textContent = translations[currentLanguage][langKeyOrPrefix];
            for(const placeholder in placeholderValues){
                textContent = textContent.replace(`{${placeholder}}`, placeholderValues[placeholder]);
            }
        } else if (translations[currentLanguage][langKeyOrPrefix] && !isPlaceholderLogic) {
             textContent = translations[currentLanguage][langKeyOrPrefix] + dynamicValue;
        } else if (!translations[currentLanguage][langKeyOrPrefix] && isPlaceholderLogic) {
             textContent = langKeyOrPrefix;
             for(const placeholder in placeholderValues){
                textContent = textContent.replace(`{${placeholder}}`, placeholderValues[placeholder]);
            }
        }
         else {
            textContent = langKeyOrPrefix + dynamicValue;
        }

        if (element.matches('.bet-count__title') && element.querySelector('#total')) {
             element.childNodes[0].nodeValue = translations[currentLanguage].totalBetsPrefix;
             element.querySelector('#total').textContent = dynamicValue;
        } else if (element.matches('.inventory-bid__title') && element.querySelector('.inventory-bid__title-num')){
             element.childNodes[0].nodeValue = translations[currentLanguage].totalBetsPrefix;
             element.querySelector('.inventory-bid__title-num').textContent = dynamicValue;
        }
        // Adjusted this condition to be more general if needed, or removed if specific keys handle it.
        // For now, assuming specific keys friendsInvite10Task etc. are handled by the general textContent update.
        else if (element.matches('.friends .task-item span[data-lang-key^="friendsInvite"]') && langKeyOrPrefix.startsWith('friendsInviteXFriendsTaskPlaceholder')) {
             targetElement.textContent = textContent;
        } else if (element.matches('.invited-header h4[data-lang-key="friendsInvitedHeaderPrefix"]') && langKeyOrPrefix === 'friendsInvitedHeaderPrefix') {
             targetElement.textContent = textContent;
        } else if (element.matches('.giveaway-right-paragraph__mail[data-lang-key="giveawaySubscribePrefix"]')) {
             const spanElement = element.querySelector('span');
             element.childNodes[0].nodeValue = translations[currentLanguage].giveawaySubscribePrefix;
             if(spanElement) element.appendChild(spanElement);
        }
         else {
            targetElement.textContent = textContent;
        }
    };