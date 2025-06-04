// script.js – ガチャ報酬ゲーム（最新版）

const rewards = [
  // 🎉 コモン（合計 110）
  { name: "顔を洗う", chance: 15 },
  { name: "耳栓を使う", chance: 15 },
  { name: "洗濯機を回す", chance: 12 },
  { name: "アイマスクを使う", chance: 12 },
  { name: "夕食を50%追加", chance: 12 },
  { name: "翌朝に鼻うがい", chance: 12 },
  { name: "ギュ (ハグ) をする", chance: 10 },
  { name: "お菓子を食べる", chance: 10 },
  { name: "食器を洗う", chance: 6 },
  { name: "お風呂に入る (有効48h)", chance: 6 },

  // ✨ レア（合計 5.8）
  { name: "散歩に行く", chance: 1.0 },
  { name: "フリマアプリに不用品を出品", chance: 1.0 },
  { name: "全力掃除30分タイマー", chance: 0.8 },
  { name: "読書30分タイマー", chance: 0.8 },
  { name: "漫画喫茶に行く", chance: 0.6 },
  { name: "編み物グッズを買う", chance: 0.6 },
  { name: "新しいChocozapに行く", chance: 0.3 },
  { name: "●●系カフェに行く", chance: 0.3 },

  // 🌈 スーパーレア（合計 1.51）
  { name: "温泉に行く", chance: 0.2 },
  { name: "ゲーム1DAY", chance: 0.2 },
  { name: "ボランティアDay", chance: 0.1 },
  { name: "国内旅行", chance: 0.1 },
  { name: "グルメロシアンルーレット", chance: 0.1 },
  { name: "映画を鑑賞する", chance: 0.1 },
  { name: "サイクリングに行く", chance: 0.1 },
  { name: "ルーレット旅に行く", chance: 0.1 },
  { name: "追加で5回抽選", chance: 0.1 },
  { name: "登山/トレッキングに行く", chance: 0.1 },
  { name: "泳ぎに行く", chance: 0.1 },
  { name: "逆利き Day", chance: 0.05 },
  { name: "冷水シャワー Day", chance: 0.05 },
  { name: "日本語10回だけ Day", chance: 0.05 },
  { name: "○○教室ワークショップに参加", chance: 0.03 },
  { name: "海外旅行に行く", chance: 0.01 },
  { name: "24時間列車旅", chance: 0.01 }
];



const MAX_HOLD = 2;
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

function renderRewardTable() {
  const tbody = document.querySelector("#rewardTable tbody");
  const sorted = [...rewards].sort((a, b) => b.chance - a.chance);
  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.chance}</td>
    </tr>
  `).join("");
}

function drawReward() {
  const totalChance = rewards.reduce((sum, r) => sum + r.chance, 0);
  let roll = Math.random() * totalChance;
  for (const reward of rewards) {
    roll -= reward.chance;
    if (roll < 0) return reward.name;
  }
  return rewards[rewards.length - 1].name;
}

function getRewardChance(name) {
  const r = rewards.find(r => r.name === name);
  return r ? r.chance : 0;
}

// --- チケット機能追加 ---

const TICKET_KEY = 'gacha_ticket_count';

// チケット残数取得・保存
function loadTickets() {
  return parseInt(localStorage.getItem(TICKET_KEY) || "0", 10);
}
function saveTickets(count) {
  localStorage.setItem(TICKET_KEY, count.toString());
}

// 表示を更新
function renderTicketDisplay() {
  const el = document.getElementById("ticketCountDisplay");
  const count = loadTickets();
  el.textContent = `🎫 残りチケット: ${count}`;
  const gachaBtn = document.getElementById("drawButton");
  gachaBtn.disabled = count <= 0;
}

function renderInventory() {
  const inv = loadInventory();
  const countMap = {};
  inv.forEach(name => countMap[name] = (countMap[name] || 0) + 1);
  const inventoryArea = document.getElementById("inventory");
  const html = Object.entries(countMap).map(([name, count]) => `
    <div class="card">
      ${name}
      ${count > 1 ? `<span class="badge">×${count}</span>` : ''}
      <button class="use-button" onclick='window.useItem("${encodeURIComponent(name)}")'>使用する</button>
    </div>
  `).join("") || '<div class="small">まだ報酬はありません。</div>';
  inventoryArea.innerHTML = html;
}

function renderResults(names, inventorySnapshot) {
  const resultArea = document.getElementById("gachaSlot");
  resultArea.innerHTML = "";

  names.forEach(name => {
    const rarity = getRewardChance(name);
    let rarityClass = "";
    let extraEffectClass = "";

    if (rarity <= 0.01) {
      rarityClass = "legendary";
      extraEffectClass = "rare-effect";
      document.body.classList.add("flash-rare");
      setTimeout(() => document.body.classList.remove("flash-rare"), 800);
      const rareAudio = new Audio("./sounds/rare_event.mp3");
      rareAudio.play();
    } else if (rarity <= 0.05) {
      rarityClass = "epic";
    } else if (rarity < 1) {
      rarityClass = "rare";
    }

    const isMaxed = (inventorySnapshot[name] || 0) >= MAX_HOLD;
    const card = document.createElement("div");
    card.className = `card ${rarityClass} ${extraEffectClass}`;
    card.style.opacity = isMaxed ? '0.4' : '1';
    card.innerHTML = `
      ${name}
      ${isMaxed ? '<div class="badge">所持数上限</div>' : ''}
    `;
    resultArea.appendChild(card);
  });
}


window.useItem = function(encodedName) {
  const name = decodeURIComponent(encodedName);
  const inv = loadInventory();
  const idx = inv.indexOf(name);
  if (idx !== -1) {
    inv.splice(idx, 1);
    saveInventory(inv);
    renderInventory();
  }
};

window.resetInventory = function() {
  localStorage.removeItem(STORAGE_KEY);
  renderInventory();
};

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  const gachaBtn = document.getElementById("drawButton");
  const resetBtn = document.getElementById("resetBtn");
  const addTicketBtn = document.getElementById("addTicketBtn");
  const ticketInput = document.getElementById("ticketInput");
  const statsBtn = document.getElementById("showStatsBtn");

  // --- チケット追加/減算処理 ---
  addTicketBtn.addEventListener("click", () => {
    const current = loadTickets();
    const delta = parseInt(ticketInput.value, 10);
    if (!isNaN(delta) && delta !== 0) {
      const updated = Math.max(current + delta, 0);
      saveTickets(updated);
      renderTicketDisplay();
      ticketInput.value = "";
    }
  });

  // --- 抽選処理 ---
  gachaBtn.addEventListener("click", () => {
    const currentTickets = loadTickets();
    if (currentTickets <= 0) {
      alert("チケットが足りません！");
      gachaBtn.disabled = true;
      return;
    }

    saveTickets(currentTickets - 1);
    renderTicketDisplay();

    playSound("start");
    flashEffect();
    gachaBtn.disabled = true;

    const resultArea = document.getElementById("gachaSlot");
    resultArea.innerHTML = '<div class="rolling-text">抽選中...</div>';
    playSound("rolling");

    setTimeout(() => {
      const results = [];
      for (let i = 0; i < 5; i++) results.push(drawReward());

      const inv = loadInventory();
      const inventorySnapshot = {};
      inv.forEach(name => inventorySnapshot[name] = (inventorySnapshot[name] || 0) + 1);

      const gained = [];
      results.forEach(name => {
        const count = inventorySnapshot[name] || 0;
        if (count < MAX_HOLD) {
          inv.push(name);
          inventorySnapshot[name] = count + 1;
          gained.push(name);
          if (getRewardChance(name) <= 5) playSound("rare");
        } else {
          gained.push(name);
        }
      });

      saveInventory(inv);
      renderResults(gained, inventorySnapshot);
      renderInventory();
      logHistory(gained); // 🔥 履歴保存
      gachaBtn.disabled = false;
    }, 1800);
  });

  // --- リセット処理 ---
  resetBtn.addEventListener("click", () => {
    window.resetInventory();
  });

  // --- 統計＆履歴ボタン処理 ---
  statsBtn?.addEventListener("click", () => {
    const history = JSON.parse(localStorage.getItem("gacha_history") || "[]");
    const countMap = {};
    let ultraRareCount = 0;

    history.forEach(name => {
      countMap[name] = (countMap[name] || 0) + 1;
      if (getRewardChance(name) <= 0.2) ultraRareCount++;
    });

    const ssrRate = ((ultraRareCount / history.length) * 100).toFixed(2);
    const display = Object.entries(countMap).sort((a, b) => b[1] - a[1]);

    document.getElementById("historyStats").innerHTML = `
      <p>履歴数: ${history.length} 件</p>
      <p>SSR出現率: <strong>${ssrRate}%</strong></p>
      <ul>${display.map(([name, count]) => `<li>${name}: ${count}回</li>`).join("")}</ul>
    `;

    if (!window.Chart) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = drawChart;
      document.head.appendChild(script);
    } else {
      drawChart();
    }

    function drawChart() {
      const ctx = document.getElementById("historyChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: display.map(([name]) => name),
          datasets: [{
            label: "出現回数",
            data: display.map(([, count]) => count)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "ガチャ履歴統計" }
          },
          scales: {
            x: { ticks: { maxRotation: 60, minRotation: 30, autoSkip: false } },
            y: { beginAtZero: true }
          }
        }
      });
    }
  });

  // --- 初期描画 ---
  renderInventory();
  renderRewardTable();
  renderTicketDisplay();
});

function logHistory(rewards) {
  const history = JSON.parse(localStorage.getItem("gacha_history") || "[]");
  const updated = [...history, ...rewards];
  const limited = updated.slice(-100); // 最新100件に制限
  localStorage.setItem("gacha_history", JSON.stringify(limited));
}


// デバッグ用：drawRewardをグローバル公開
window.drawReward = drawReward;
