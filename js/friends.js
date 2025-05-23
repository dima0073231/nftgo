const copyButton = document.getElementById("copyLinkBtn");
const notification = document.getElementById("copyNotification");

if (copyButton) {
    copyButton.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText("https://t.me/nftgo_bot");
            notification.classList.add("show");
            setTimeout(() => notification.classList.remove("show"), 2000);
        } catch (err) {
            alert("Не удалось скопировать ссылку. Попробуйте вручную.");
        }
    });
}

const inviteMainButton = document.querySelector(".invite-button-main");

let invitedFriendsCount = 0;
let referralTonBalance = 0;
const invitedFriendsData = [];
const processedReferralEvents = new Set();
let nextSimulatedFriendNumericId = 1;

const rewardTiers = [
    { friends: 10, reward: 0.05, claimed: false },
    { friends: 25, reward: 0.1, claimed: false },
    { friends: 50, reward: 0.15, claimed: false },
    { friends: 100, reward: 0.2, claimed: false }
];

let currentSimulatedReferralId = null;
let isInvitationActive = false;

const referralTonBalanceEl = document.getElementById('referralTonBalanceAmount');
const withdrawButton = document.querySelector('.withdraw-button');
const invitedCountHeaderEl = document.getElementById('invitedCountHeader');
const invitedFriendsListContainerEl = document.getElementById('invitedFriendsListContainer');
const noInvitedFriendsMessageEl = document.getElementById('noInvitedFriendsMessage');

function updateReferralBalanceDisplay() {
    if (referralTonBalanceEl) {
        referralTonBalanceEl.innerHTML = `${referralTonBalance.toFixed(2)} <img src="web/images/main/ton-icon.svg" class="diamond-icon" alt="ton-icon"/>`;
    }
}

function updateInvitedCountDisplay() {
    if (invitedCountHeaderEl) {
        invitedCountHeaderEl.textContent = `Invited (${invitedFriendsCount})`;
    }

    const taskItems = document.querySelectorAll('.task-list .task-item');
    taskItems.forEach(taskItem => {
        const progressTextEl = taskItem.querySelector('.progress-text');
        const targetFriendsAttr = taskItem.getAttribute('data-tier-friends');

        if (progressTextEl && targetFriendsAttr) {
            const targetFriends = parseInt(targetFriendsAttr, 10);
            const currentProgress = Math.min(invitedFriendsCount, targetFriends);
            progressTextEl.textContent = `${currentProgress} / ${targetFriends}`;

            const tier = rewardTiers.find(t => t.friends === targetFriends);
            if (tier) {
                 if (tier.claimed || invitedFriendsCount >= targetFriends) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }
            }
        }
    });
}

function displayInvitedFriends() {
    if (!invitedFriendsListContainerEl) return;

    const existingMessage = invitedFriendsListContainerEl.querySelector('#noInvitedFriendsMessage');
    invitedFriendsListContainerEl.innerHTML = '';
    if (existingMessage) {
         invitedFriendsListContainerEl.appendChild(existingMessage);
    }

    if (invitedFriendsData.length === 0) {
        if (noInvitedFriendsMessageEl) {
            noInvitedFriendsMessageEl.style.display = 'block';
        }
    } else {
        if (noInvitedFriendsMessageEl) {
            noInvitedFriendsMessageEl.style.display = 'none';
        }
        const fragment = document.createDocumentFragment();
        invitedFriendsData.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.classList.add('invited-friend-item');

            const nicknameSpan = document.createElement('span');
            nicknameSpan.textContent = friend.nickname;

            const profitSpan = document.createElement('span');
            profitSpan.innerHTML = `0.00 <img src="web/images/main/ton-icon.svg" class="diamond-icon invited-friend-profit-icon" />`;

            friendItem.appendChild(nicknameSpan);
            friendItem.appendChild(profitSpan);
            fragment.appendChild(friendItem);
        });
        invitedFriendsListContainerEl.appendChild(fragment);
    }
}

async function getNicknameForSimulation() {
    const currentUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    let baseUsernameToUse = null;

    if (currentUser?.id) {
        try {
            const response = await fetch("https://nftbotserver.onrender.com/api/users");
            if (response.ok) {
                const users = await response.json();
                const userData = users.find(user => user.telegramId == currentUser.id);
                if (userData && userData.username) {
                    baseUsernameToUse = userData.username;
                }
            } else {
                 console.warn("Network response was not ok when fetching users for nickname simulation.");
            }
        } catch (error) {
            console.error("Error fetching nickname via API for simulation:", error);
        }
    }

    if (!baseUsernameToUse && currentUser?.username) {
        baseUsernameToUse = currentUser.username;
    }

    if (baseUsernameToUse) {
        const countOfThisUser = invitedFriendsData.filter(f => f.nickname && f.nickname.startsWith(baseUsernameToUse)).length;
        if (countOfThisUser > 0) {
            return `${baseUsernameToUse} (${countOfThisUser + 1})`;
        }
        return baseUsernameToUse;
    }

    const fallbackNickname = `Friend #${nextSimulatedFriendNumericId}`;
    nextSimulatedFriendNumericId++;
    return fallbackNickname;
}

async function simulateFriendJoining(referralEventId) {
    if (!referralEventId) {
        isInvitationActive = false;
        return;
    }

    if (processedReferralEvents.has(referralEventId)) {
        return;
    }
    processedReferralEvents.add(referralEventId);

    const friendNickname = await getNicknameForSimulation();

    invitedFriendsCount++;
    invitedFriendsData.push({ id: referralEventId, nickname: friendNickname, profit: 0.00 });

    rewardTiers.forEach(tier => {
        if (!tier.claimed && invitedFriendsCount >= tier.friends) {
            referralTonBalance += tier.reward;
            tier.claimed = true;
        }
    });

    updateInvitedCountDisplay();
    updateReferralBalanceDisplay();
    displayInvitedFriends();

    isInvitationActive = false;
    currentSimulatedReferralId = null;
}

function withdrawFunds() {
    if (referralTonBalance > 0) {
        alert(`Attempting to withdraw ${referralTonBalance.toFixed(2)} TON. (This is a placeholder for actual withdrawal functionality)`);
    } else {
        alert("No funds to withdraw.");
    }
}

if (inviteMainButton) {
    inviteMainButton.addEventListener("click", async function () {
        const telegramDeepLink = "https://t.me/nftgo_bot";
        const shareMessage = `
🚀 *Привет!*  
🌟 Я приглашаю тебя в *эксклюзивного Telegram-бота*!  

💰 *Бонус:* Получи *10%* от депозита друга!  
🔗 [Открыть бота](https://t.me/nftgo_bot)  

🔥 *Присоединяйся прямо сейчас!*  
`;
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(telegramDeepLink)}&text=${encodeURIComponent(shareMessage)}`,
            "_blank"
        );

        let referralIdToProcess;
        if (!isInvitationActive) {
            currentSimulatedReferralId = `sim_ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            isInvitationActive = true;
            referralIdToProcess = currentSimulatedReferralId;
        } else {
            referralIdToProcess = currentSimulatedReferralId;
        }
        
        if (referralIdToProcess) {
            setTimeout(async () => {
                await simulateFriendJoining(referralIdToProcess);
            }, 750); 
        }
    });
}

if (withdrawButton) {
    withdrawButton.addEventListener('click', withdrawFunds);
}

document.addEventListener('DOMContentLoaded', () => {
    updateReferralBalanceDisplay();
    updateInvitedCountDisplay();
    displayInvitedFriends();
});