Edit in JSFiddle
JavaScript
/* ==================================
   BURRITO CLICKER — GAME ENGINE
   ================================== */

const SAVE_KEY = "burritoClickerSave_v1";

const achievements = [
  {
    id: "firstBite",
    name: "First Bite",
    description: "Make your first burrito.",
    requirement: () => state.totalMade >= 1,
    reward: 10
  },
  {
    id: "gettingCooking",
    name: "Getting Cooking",
    description: "Purchase your first upgrade.",
    requirement: () => upgrades.some(u => getOwned(u.id) >= 1),
    reward: 25
  },
  {
    id: "beginner",
    name: "Burrito Beginner",
    description: "Make 100 burritos in total.",
    requirement: () => state.totalMade >= 100,
    reward: 50
  },
  {
    id: "factoryOwner",
    name: "Factory Owner",
    description: "Own a Burrito Factory.",
    requirement: () => getOwned("factory") >= 1,
    reward: 500
  },
  {
    id: "tycoon",
    name: "Burrito Tycoon",
    description: "Make 10,000 burritos in total.",
    requirement: () => state.totalMade >= 10000,
    reward: 1000
  },
  {
    id: "beyondReality",
    name: "Beyond Reality",
    description: "Own a Burrito Multiverse.",
    requirement: () => getOwned("multiverse") >= 1,
    reward: 1000000
  }
];

let unlockedAchievements = [];

const upgrades = [
  // CLICK UPGRADES
  {
    id: "spatula",
    name: "🥄 Golden Spatula",
    description: "+1 burrito per click.",
    baseCost: 25,
    type: "click",
    power: 1,
    cps: 0
  },
  {
    id: "turboWrap",
    name: "⚡ Turbo Wrapper",
    description: "+5 burritos per click.",
    baseCost: 250,
    type: "click",
    power: 5,
    cps: 0
  },
  {
    id: "chefGloves",
    name: "🧤 Chef's Gloves",
    description: "Double your click power!",
    baseCost: 2500,
    type: "multiplier",
    power: 2,
    cps: 0
  },
  {
    id: "robotArms",
    name: "🤖 Robot Arms",
    description: "+50 burritos per click.",
    baseCost: 25000,
    type: "click",
    power: 50,
    cps: 0
  },
  {
    id: "masterChef",
    name: "👨‍🍳 Master Chef",
    description: "Triple your click power!",
    baseCost: 1000000,
    type: "multiplier",
    power: 3,
    cps: 0
  },

  // AUTOMATIC PRODUCTION
  {
    id: "chef",
    name: "🥄 Amateur Chef",
    description: "A chef who makes burritos on the side.",
    baseCost: 25,
    type: "production",
    cps: 1
  },
  {
    id: "foodTruck",
    name: "🚚 Burrito Truck",
    description: "Takes your burrito business on the road.",
    baseCost: 100,
    type: "production",
    cps: 5
  },
  {
    id: "restaurant",
    name: "🏪 Burrito Restaurant",
    description: "A full restaurant dedicated to burritos.",
    baseCost: 500,
    type: "production",
    cps: 25
  },
  {
    id: "factory",
    name: "🏭 Burrito Factory",
    description: "Industrial-scale burrito production.",
    baseCost: 2500,
    type: "production",
    cps: 100
  },
  {
    id: "empire",
    name: "👑 Burrito Empire",
    description: "You practically own the burrito world.",
    baseCost: 15000,
    type: "production",
    cps: 500
  },
  {
    id: "farm",
    name: "🌱 Burrito Farms",
    description: "Grow ingredients on an enormous scale.",
    baseCost: 100000,
    type: "production",
    cps: 2500
  },
  {
    id: "moonBase",
    name: "🌕 Lunar Burrito Base",
    description: "The moon is your newest market.",
    baseCost: 1000000,
    type: "production",
    cps: 15000
  },
  {
    id: "timeMachine",
    name: "Burrito Time Machine",
    description: "Import burritos from the future.",
    baseCost: 25000000,
    type: "production",
    cps: 100000
  },
  {
    id: "dimension",
    name: "🌀 Burrito Dimension",
    description: "An entire universe of burritos.",
    baseCost: 1000000000,
    type: "production",
    cps: 1000000
  },
  {
    id: "multiverse",
    name: "🌌 Burrito Multiverse",
    description: "Every possible universe makes burritos.",
    baseCost: 100000000000,
    type: "production",
    cps: 10000000
  }
];

const state = {
  burritos: 0,
  totalMade: 0,
  perClick: 1,
  owned: {}
};

const burritoCount = document.querySelector("#burrito-count");
const totalMade = document.querySelector("#total-made");
const perClick = document.querySelector("#per-click");
const burritoRate = document.querySelector("#burrito-rate");
const burritoButton = document.querySelector("#burrito-button");
const upgradeList = document.querySelector("#upgrade-list");
const resetButton = document.querySelector("#reset-button");
const saveStatus = document.querySelector(".save-status");

let saveTimer;
let lastFrame = performance.now();

upgrades.forEach(upgrade => {
  state.owned[upgrade.id] = 0;
});

function getOwned(id) {
  return state.owned[id] || 0;
}

function getCost(upgrade) {
  return Math.floor(
    upgrade.baseCost * Math.pow(1.15, getOwned(upgrade.id))
  );
}

function getBurritosPerSecond() {
  return upgrades.reduce((total, upgrade) => {
    return total + getOwned(upgrade.id) * upgrade.cps;
  }, 0);
}

function formatNumber(number) {
  if (number < 1000) {
    return Number(number.toFixed(1)).toLocaleString("en-US");
  }

  const units = ["K", "M", "B", "T", "Qa", "Qi"];
  let unitIndex = -1;
  let value = number;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return value.toFixed(2) + units[unitIndex];
}



function checkAchievements() {
  let changed = false;

  achievements.forEach(achievement => {
    if (
      !unlockedAchievements.includes(achievement.id) &&
      achievement.requirement()
    ) {
      unlockedAchievements.push(achievement.id);
      state.burritos += achievement.reward;
      changed = true;
    }
  });

  if (changed) {
    saveGame();
  }
}

function renderAchievements() {
  const list = document.getElementById("achievement-list");
  if (!list) return;

  list.replaceChildren();

  achievements.forEach(achievement => {
    const unlocked =
      unlockedAchievements.includes(achievement.id);

    const card = document.createElement("div");
    card.className = "achievement-card " +
      (unlocked ? "unlocked" : "locked");

    const info = document.createElement("div");
    info.className = "achievement-info";

    const name = document.createElement("h3");
    name.textContent = achievement.name;

    const description = document.createElement("p");
    description.textContent = achievement.description;

    const reward = document.createElement("div");
    reward.className = "achievement-reward";
    reward.textContent = unlocked
      ? "UNLOCKED"
      : "+" + formatNumber(achievement.reward);

    info.append(name, description);
    card.append(info, reward);
    list.appendChild(card);
  });

  const count = unlockedAchievements.length;

  document.getElementById("achievement-progress").textContent =
    count + " / " + achievements.length;

  document.getElementById("achievement-progress-fill").style.width =
    (count / achievements.length * 100) + "%";
}
function renderUpgrades() {
  const clickList = document.getElementById("click-upgrade-list");
  const autoList = document.getElementById("auto-upgrade-list");

  clickList.replaceChildren();
  autoList.replaceChildren();

  upgrades.forEach(upgrade => {
    const cost = getCost(upgrade);
    const owned = getOwned(upgrade.id);

    const card = document.createElement("div");
    card.className = "upgrade-card";

    const info = document.createElement("div");
    info.className = "upgrade-info";

    const name = document.createElement("h3");
    name.textContent = upgrade.name;

    const description = document.createElement("p");
    description.textContent = upgrade.description;

    const price = document.createElement("div");
    price.className = "upgrade-price";
    price.textContent = "🌯 " + formatNumber(cost);

    const ownedText = document.createElement("p");

    if (upgrade.type === "click") {
      ownedText.textContent =
        "Owned: " + owned + " · +" +
        formatNumber(upgrade.power) + " per click each";
    } else if (upgrade.type === "multiplier") {
      ownedText.textContent =
        "Owned: " + owned + " · ×" +
        upgrade.power + " click power each";
    } else {
      ownedText.textContent =
        "Owned: " + owned + " · +" +
        formatNumber(upgrade.cps) + "/sec each";
    }

    info.append(name, description, price, ownedText);
     
const buyButton = document.createElement("button");
buyButton.textContent = "BUY";

    buyButton.disabled = state.burritos + 0.000001 < cost;


    buyButton.addEventListener("click", () => {
  buyUpgrade(upgrade);
  });

    card.append(info, buyButton);

    if (
      upgrade.type === "click" ||
      upgrade.type === "multiplier"
    ) {
      clickList.appendChild(card);
    } else {
      autoList.appendChild(card);
    }
  });
}

  function render() {
    burritoCount.textContent = formatNumber(state.burritos);
    totalMade.textContent = formatNumber(state.totalMade);
    perClick.textContent = formatNumber(state.perClick);

    burritoRate.textContent =
      formatNumber(getBurritosPerSecond()) + " burritos per second";

    renderUpgrades();
    renderAchievements();
  }

  function makeBurrito() {
    state.burritos += state.perClick;
    state.totalMade += state.perClick;

    checkAchievements();
    render();
    scheduleSave();
  }


  function buyUpgrade(upgrade) {
    const cost = getCost(upgrade);
    const balance = state.burritos;

    // Check the real balance against the current price.
    if (balance < cost) {
      render();
      return;
    }

    state.burritos = balance - cost;
    state.owned[upgrade.id] = getOwned(upgrade.id) + 1;

if (upgrade.type === "click") {
  state.perClick += upgrade.power;
}

if (upgrade.type === "multiplier") {
  state.perClick *= upgrade.power;
}

    render();
    saveGame();
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      if (saveStatus) {
        saveStatus.textContent = "● GAME SAVED";
      }
    } catch (error) {
      if (saveStatus) {
        saveStatus.textContent = "● SAVE UNAVAILABLE";
      }
    }
  }

  function scheduleSave() {
    if (saveStatus) {
      saveStatus.textContent = "● SAVING...";
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveGame, 300);
  }

  function loadGame() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      if (
        typeof data.burritos !== "number" ||
        !Number.isFinite(data.burritos) ||
        data.burritos < 0
      ) {
        return;
      }

      state.burritos = data.burritos;

      if (
        typeof data.totalMade === "number" &&
        Number.isFinite(data.totalMade) &&
        data.totalMade >= 0
      ) {
        state.totalMade = data.totalMade;
      }

      if (
        typeof data.perClick === "number" &&
        Number.isFinite(data.perClick) &&
        data.perClick >= 1
      ) {
        state.perClick = data.perClick;
      }

      if (data.owned && typeof data.owned === "object") {
        upgrades.forEach(upgrade => {
          const amount = data.owned[upgrade.id];

          if (
            typeof amount === "number" &&
            Number.isInteger(amount) &&
            amount >= 0
          ) {
            state.owned[upgrade.id] = amount;
          }
        });
      }
    } catch (error) {
      console.warn("Couldn't load the saved game.", error);
    }
  }

  /* AUTOMATIC BURRITO PRODUCTION */


  let lastRender = 0;
  let lastAutoSave = 0;

  function gameLoop(now) {
    const elapsed = Math.min((now - lastFrame) / 1000, 0.25);
    lastFrame = now;

    const earned = getBurritosPerSecond() * elapsed;

    if (earned > 0) {
      state.burritos += earned;
      state.totalMade += earned;

      // Update the display only 4 times per second.
      if (now - lastRender >= 250) {
        render();
        lastRender = now;
      }

      // Save automatically every 5 seconds.
      if (now - lastAutoSave >= 5000) {
        saveGame();
        lastAutoSave = now;
      }
    }

    requestAnimationFrame(gameLoop);
  }

  /* BUTTON EVENTS */

  burritoButton.addEventListener("click", makeBurrito);

  /* OPTIONAL CLICK FEEDBACK */

  burritoButton.addEventListener("click", () => {
    burritoButton.style.filter = "brightness(1.08)";

    setTimeout(() => {
      burritoButton.style.filter = "";
    }, 100);
  });

  /* RESET PROGRESS */

  resetButton.addEventListener("click", () => {
    const confirmed = confirm(
      "Reset your entire Burrito Clicker game? This cannot be undone!"
    );

    if (!confirmed) return;

    state.burritos = 0;
    state.totalMade = 0;
    state.perClick = 1;

    upgrades.forEach(upgrade => {
      state.owned[upgrade.id] = 0;
    });

    render();
    saveGame();
  });

  /* START GAME */

  loadGame();
  render();
  requestAnimationFrame(gameLoop);

document.getElementById("click-tab").addEventListener("click", () => {
  document.getElementById("click-shop").hidden = false;
  document.getElementById("auto-shop").hidden = true;

  document.getElementById("click-tab").classList.add("active");
  document.getElementById("auto-tab").classList.remove("active");
});

document.getElementById("auto-tab").addEventListener("click", () => {
  document.getElementById("click-shop").hidden = true;
  document.getElementById("auto-shop").hidden = false;

  document.getElementById("auto-tab").classList.add("active");
  document.getElementById("click-tab").classList.remove("active");
});
