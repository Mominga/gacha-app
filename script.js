// script.js パート1: 定数と初期データ、ユーティリティ関数など

// 報酬リストとその確率（%）
const rewards = [
  { name: "夕食を50%追加", chance: 15 },
  { name: "翌朝に鼻うがい", chance: 15 },
  { name: "お風呂に入る (有効48h)", chance: 10 },
  { name: "顔を洗う", chance: 10 },
  { name: "食器を洗う", chance: 10 },
  { name: "洗濯機を回す", chance: 10 },
  { name: "フリマアプリに不用品を出品", chance: 5 },
  { name: "ゲーム1DAY", chance: 3 },
  { name: "全力読書30分タイマー", chance: 3 },
  { name: "映画を鑑賞する", chance: 2 },
  { name: "ルーレット旅に行く", chance: 1 },
  { name: "編み物グッズを買う", chance: 0.4 },
  { name: "新しいChocozapに行く", chance: 0.2 }
];

const MAX_HOLD = 2; // 所持上限
const STORAGE_KEY = 'gacha_inventory';

function loadInventory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveInventory(inv) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
}

function playSound(type) {
  const seClick = document.getElementById("seClick");
  const seSpin = document.getElementById("seSpin");
  const seRare = document.getElementById("seRare");

  if (type === 'start') seClick?.play();
  if (type === 'rolling') seSpin?.play();
  if (type === 'rare') seRare?.play();
}

function preloadSounds() {
  document.getElementById("seClick")?.load();
  document.getElementById("seSpin")?.load();
  document.getElementById("seRare")?.load();
}
window.addEventListener("click", preloadSounds, { once: true });

function flashEffect() {
  document.body.classList.add("flash");
  setTimeout(() => document.body.classList.remove("flash"), 800);
}

// script.js パート2: メイン処理

document.addEventListener("DOMContentLoaded", () => {
  const gachaBtn = document.getElementById("drawButton");
  const resultArea = document.getElementById("gachaSlot");
const inventoryArea = document.getElementById("inventory");


  renderInventory();

  gachaBtn.addEventListener("click", () => {
    playSound("start");
    flashEffect();
    gachaBtn.disabled = true;
    resultArea.innerHTML = '<div class="rolling-text">抽選中...</div>';
    playSound("rolling");

    setTimeout(() => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(drawReward());
      }
      const inv = loadInventory();
      const gained = [];
      results.forEach(name => {
        const count = inv.filter(item => item === name).length;
        if (count < MAX_HOLD) {
          inv.push(name);
          gained.push(name);
          if (getRewardChance(name) < 10) playSound("rare");
        }
      });
      saveInventory(inv);
      renderResults(gained);
      renderInventory();
      gachaBtn.disabled = false;
    }, 1800);
  });

  function drawReward() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const reward of rewards) {
      cumulative += reward.chance;
      if (roll < cumulative) return reward.name;
    }
    return rewards[rewards.length - 1].name;
  }

  function getRewardChance(name) {
    const r = rewards.find(r => r.name === name);
    return r ? r.chance : 0;
  }

  function renderResults(names) {
    resultArea.innerHTML = names.map(name => {
      const rarityClass = getRewardChance(name) < 1 ? 'legendary' : getRewardChance(name) < 5 ? 'epic' : getRewardChance(name) < 10 ? 'rare' : '';
      return `<div class="card ${rarityClass}">${name}</div>`;
    }).join("");
  }

  function renderInventory() {
    const inv = loadInventory();
    const countMap = {};
    inv.forEach(name => countMap[name] = (countMap[name] || 0) + 1);
    const html = Object.entries(countMap).map(([name, count]) =>
      `<div class="card">${name}${count > 1 ? ` <span class="badge">×${count}</span>` : ''}</div>`
    ).join("") || '<div class="small">まだ報酬はありません。</div>';
    inventoryArea.innerHTML = html;
  }
});


// script.js パート3: サウンド読み込みのプレロード処理と演出補足

// サウンドプリロード（ユーザー操作後に再生をスムーズに）
function preloadSounds() {
  ["seClick", "seSpin", "seRare"].forEach(id => {
    const audio = document.getElementById(id);
    audio?.load();
  });
}
window.addEventListener("click", preloadSounds, { once: true });

// ビジュアル演出
function flashEffect() {
  document.body.classList.add("flash");
  setTimeout(() => document.body.classList.remove("flash"), 800);
}

