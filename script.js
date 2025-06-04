// script.js – ガチャ報酬ゲーム（最新版）

// --- 報酬データと確率設定 ---
const rewards = [
  { name: "夕食を50%追加", chance: 20 },
  { name: "翌朝に鼻うがい", chance: 20 },
  { name: "お風呂に入る (有効48h)", chance: 20 },
  { name: "顔を洗う", chance: 20 },
  { name: "食器を洗う", chance: 20 },
  { name: "洗濯機を回す", chance: 20 },
  { name: "アイマスクを使う", chance: 20 },
  { name: "耳栓を使う", chance: 20 },
  { name: "お菓子を食べる", chance: 20 },
  { name: "ギュ (ハグ) をする", chance: 20 },
  { name: "散歩に行く", chance: 4 },
  { name: "フリマアプリに不用品を出品", chance: 2 },
  { name: "温泉に行く", chance: 1 },
  { name: "国内旅行 1泊2日", chance: 0.5 },
  { name: "グルメロシアンルーレット", chance: 0.5 },
  { name: "映画を鑑賞する", chance: 0.5 },
  { name: "漫画喫茶に行く", chance: 0.5 },
  { name: "サイクリングに行く", chance: 0.5 },
  { name: "ルーレット旅に行く", chance: 0.5 },
  { name: "ゲーム1DAY", chance: 0.5 },
  { name: "全力掃除 30 分タイマー", chance: 0.5 },
  { name: "全力読書30分タイマー", chance: 0.5 },
  { name: "●●系カフェに行く", chance: 0.5 },
  { name: "追加で5回抽選", chance: 0.5 },
  { name: "登山/トレッキングに行く", chance: 0.5 },
  { name: "泳ぎに行く", chance: 0.5 },
  { name: "逆利き Day", chance: 0.5 },
  { name: "冷水シャワー Day", chance: 0.5 },
  { name: "日本語10回だけ Day", chance: 0.5 },
  { name: "ボランティアDay", chance: 0.5 },
  { name: "編み物グッズを買う", chance: 0.5 },
  { name: "○○教室ワークショップに参加", chance: 0.25 },
  { name: "海外旅行に行く", chance: 0.1 },
  { name: "新しいChocozapに行く", chance: 0.5 },
  { name: "24時間列車旅", chance: 0.1 }
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
      <td>${r.ch
