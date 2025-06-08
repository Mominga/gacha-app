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
  { name: "釣りに行く", chance: 0.2 },
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
const TICKET_KEY = 'gacha_ticket_count';

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

function drawReward() {
  const total = rewards.reduce((sum, r) => sum + r.chance, 0);
  let roll = Math.random() * total;
  for (const r of rewards) {
    roll -= r.chance;
    if (roll < 0) return r.name;
  }
  return rewards[rewards.length - 1].name;
}

function getRewardChance(name) {
  const r = rewards.find(r => r.name === name);
  return r ? r.chance : 0;
}

function renderInventory() {
  const inv = loadInventory();
  const countMap = {};
  inv.forEach(name => countMap[name] = (countMap[name] || 0) + 1);
  const sorted = Object.entries(countMap).sort((a, b) => getRewardChance(a[0]) - getRewardChance(b[0]));
  const inventoryArea = document.getElementById("inventory");
  inventoryArea.innerHTML = sorted.map(([name, count]) => `
    <div class="card">
      ${name}
      ${count > 1 ? `<span class="badge">×${count}</span>` : ''}
      <button class="use-button" onclick='window.useItem("${encodeURIComponent(name)}")'>使用する</button>
    </div>
  `).join("") || '<div class="small">まだ報酬はありません。</div>';
}

function renderResults(names, snapshot) {
  const area = document.getElementById("gachaSlot");
  area.innerHTML = "";
  names.forEach(name => {
    const rarity = getRewardChance(name);
    let classList = "card";
    if (rarity <= 0.01) {
      classList += " legendary rare-effect";
      document.body.classList.add("flash-rare");
      setTimeout(() => document.body.classList.remove("flash-rare"), 800);
      new Audio("./sounds/rare_event.mp3").play();
    } else if (rarity <= 0.05) classList += " epic";
    else if (rarity < 1) classList += " rare";

    const isMaxed = (snapshot[name] || 0) >= MAX_HOLD;
    const div = document.createElement("div");
    div.className = classList;
    div.style.opacity = isMaxed ? "0.4" : "1";
    div.innerHTML = `${name}${isMaxed ? '<div class="badge">所持数上限</div>' : ''}`;
    area.appendChild(div);
  });
}

function renderTicketDisplay() {
  const count = loadTickets();
  document.getElementById("ticketCountDisplay").textContent = `🎫 残りチケット: ${count}`;
  document.getElementById("drawButton").disabled = count <= 0;
}
function loadTickets() {
  return parseInt(localStorage.getItem(TICKET_KEY) || "0", 10);
}
function saveTickets(n) {
  localStorage.setItem(TICKET_KEY, n.toString());
}

function renderRewardTable() {
  const tbody = document.querySelector("#rewardTable tbody");
  const sorted = [...rewards].sort((a, b) => b.chance - a.chance);
  tbody.innerHTML = sorted.map(r => `<tr><td>${r.name}</td><td>${r.chance}</td></tr>`).join("");
}

function logHistory(rewards) {
  const history = JSON.parse(localStorage.getItem("gacha_history") || "[]");
  const updated = [...history, ...rewards].slice(-100);
  localStorage.setItem("gacha_history", JSON.stringify(updated));
}
function renderStats() {
  const history = JSON.parse(localStorage.getItem("gacha_history") || "[]");
  const countMap = {};
  let ultraRareCount = 0;

  // 集計
  history.forEach(name => {
    countMap[name] = (countMap[name] || 0) + 1;
    if (getRewardChance(name) <= 0.2) ultraRareCount++;
  });

  const ssrRate = history.length > 0 ? ((ultraRareCount / history.length) * 100).toFixed(2) : "0.00";
  const display = Object.entries(countMap).sort((a, b) => b[1] - a[1]);

  // HTML表示
  document.getElementById("historyStats").innerHTML = `
    <p>履歴数: ${history.length} 件</p>
    <p>SSR出現率: <strong>${ssrRate}%</strong></p>
    <ul>${display.map(([name, count]) => `<li>${name}: ${count}回</li>`).join("")}</ul>
  `;

  // Chart.js の読み込みと描画
  if (!window.Chart) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => drawChart(display);
    document.head.appendChild(script);
  } else {
    drawChart(display);
  }

  function drawChart(data) {
    const ctx = document.getElementById("historyChart").getContext("2d");
    if (window.historyChartInstance) {
      window.historyChartInstance.destroy(); // 前のチャートを消す
    }
    window.historyChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(([name]) => name),
        datasets: [{
          label: "出現回数",
          data: data.map(([, count]) => count),
          backgroundColor: "#4fc3f7"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "ガチャ履歴統計" }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 60,
              minRotation: 30
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}


window.useItem = function(encoded) {
  const name = decodeURIComponent(encoded);
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

document.addEventListener("DOMContentLoaded", () => {
  const gachaBtn = document.getElementById("drawButton");
  const resetBtn = document.getElementById("resetBtn");
  const addTicketBtn = document.getElementById("addTicketBtn");
  const ticketInput = document.getElementById("ticketInput");
  const resetStatsBtn = document.getElementById("resetStatsBtn");

  addTicketBtn.addEventListener("click", () => {
    const delta = parseInt(ticketInput.value, 10);
    if (!isNaN(delta)) {
      const updated = Math.max(loadTickets() + delta, 0);
      saveTickets(updated);
      renderTicketDisplay();
      ticketInput.value = "";
    }
  });

  gachaBtn.addEventListener("click", () => {
    if (loadTickets() <= 0) return alert("チケットが足りません！");
    saveTickets(loadTickets() - 1);
    renderTicketDisplay();
    playSound("start");
    flashEffect();
    gachaBtn.disabled = true;
    document.getElementById("gachaSlot").innerHTML = '<div class="rolling-text">抽選中...</div>';
    playSound("rolling");

    setTimeout(() => {
      const results = [];
      const nameCount = {};
     while (results.length < 5) {
  const name = drawReward();
  if ((nameCount[name] || 0) < 3) {  // ←ここを2から3に変更
    results.push(name);
    nameCount[name] = (nameCount[name] || 0) + 1;
  }
}


      const inv = loadInventory();
      const snapshot = {};
      inv.forEach(name => snapshot[name] = (snapshot[name] || 0) + 1);
      const gained = [];
      results.forEach(name => {
        const count = snapshot[name] || 0;
        if (count < MAX_HOLD) {
          inv.push(name);
          snapshot[name] = count + 1;
        }
        gained.push(name);
        if (getRewardChance(name) <= 5) playSound("rare");
      });

      saveInventory(inv);
      renderResults(gained, snapshot);
      renderInventory();
      logHistory(gained);
      renderStats();
      gachaBtn.disabled = false;
    }, 1800);
  });

  resetBtn.addEventListener("click", window.resetInventory);
  resetStatsBtn.addEventListener("click", () => {
    localStorage.removeItem("gacha_history");
    document.getElementById("historyStats").innerHTML = "";
    const ctx = document.getElementById("historyChart").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });

  renderInventory();
  renderRewardTable();
  renderTicketDisplay();
  renderStats();
});



// デバッグ用：drawRewardをグローバル公開
window.drawReward = drawReward;
