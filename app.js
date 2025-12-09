// app.js - lightweight dashboard logic
const parasitaAddr = "0x401cd9b24a3940333057242485fded833a04ad52".toLowerCase();
const mamacocoAddr = "0x6C70f9870DF0A1A2C925522b548B2CD37B7C63Fd".toLowerCase();

// DexScreener token API base
const DEXS = "https://api.dexscreener.com/latest/dex/tokens";

async function fetchDexData(addr){
  try{
    const res = await fetch(`${DEXS}/${addr}`);
    if(!res.ok) throw new Error("dex error");
    const j = await res.json();
    return j;
  }catch(e){
    console.warn("fetchDexData error", e.message);
    return null;
  }
}

function formatUsd(value){
  if(value===null||value===undefined) return "—";
  return Number(value).toLocaleString(undefined, {maximumFractionDigits:2});
}

async function updateTokenPanel(){
  // PARASITA
  const p = await fetchDexData(parasitaAddr);
  if(p && p.pairs && p.pairs[0]){
    const pair = p.pairs[0];
    document.getElementById("p-price").textContent = formatUsd(pair.priceUsd);
    document.getElementById("p-volume").textContent = formatUsd(pair.volume.h24);
    document.getElementById("p-liquidity").textContent = formatUsd(pair.liquidity.usd);
    drawSimpleChart("parasita-chart", pair.sparkline.map(s=>({x:s[0], y:s[1]})));
  } else {
    document.getElementById("p-price").textContent = "N/A";
  }

  // MAMACOCO
  const m = await fetchDexData(mamacocoAddr);
  if(m && m.pairs && m.pairs[0]){
    const pair = m.pairs[0];
    document.getElementById("m-price").textContent = formatUsd(pair.priceUsd);
    document.getElementById("m-volume").textContent = formatUsd(pair.volume.h24);
    document.getElementById("m-liquidity").textContent = formatUsd(pair.liquidity.usd);
    drawSimpleChart("mamacoco-chart", pair.sparkline.map(s=>({x:s[0], y:s[1]})));
  } else {
    document.getElementById("m-price").textContent = "N/A";
  }
}

function drawSimpleChart(canvasId, dataPoints){
  if(!dataPoints || dataPoints.length===0) return;
  // Convert to arrays for Chart.js
  const labels = dataPoints.map(d => {
    const dt = new Date(d.x);
    return dt.getHours()+":"+String(dt.getMinutes()).padStart(2,"0");
  });
  const values = dataPoints.map(d => d.y);
  const ctx = document.getElementById(canvasId).getContext("2d");
  // Clear previous chart if any
  if(ctx._chartInstance){
    ctx._chartInstance.destroy();
  }
  ctx._chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price USD',
        data: values,
        backgroundColor: 'rgba(0,255,102,0.08)',
        borderColor: 'rgba(0,255,102,0.9)',
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { ticks: { color: '#bbb' }, grid: { color: '#0e0e0e' } }
      }
    }
  });
}

// init
document.getElementById("year").textContent = new Date().getFullYear();
updateTokenPanel();
// refresh every 2 minutes
setInterval(updateTokenPanel, 120000);
