/* ============================================================
   CAMPIONATO TRA AMICI - app.js
   Dati salvati in localStorage. Struttura:
   players: [{id, name, overall}]
   matches: [{id, date, type, scoreA, scoreB, teamA:[playerId], teamB:[playerId], scorers:[{playerId, goals}]}]
   ============================================================ */

const STORAGE_KEY_PLAYERS = "campionato_players";
const STORAGE_KEY_MATCHES = "campionato_matches";

const TIPO_LABELS = {
  calcetto: "Calcetto (5vs5)",
  calcio6: "Calcio a 6",
  calcio7: "Calcio a 7",
  calcio8: "Calcio a 8"
};

let players = loadPlayers();
let matches = loadMatches();

let charts = {}; // istanze Chart.js attive

/* ------------------ STORAGE ------------------ */

function loadPlayers() {
  const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function loadMatches() {
  const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function savePlayers() {
  localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
}

function saveMatches() {
  localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ------------------ TAB NAVIGATION ------------------ */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "dashboard") renderClassifica();
    if (btn.dataset.tab === "nuova-partita") renderPlayerPickers();
    if (btn.dataset.tab === "partite") renderListaPartite();
    if (btn.dataset.tab === "giocatori") renderTabellaGiocatori();
    if (btn.dataset.tab === "statistiche") renderTuttiGrafici();
  });
});

/* ------------------ GIOCATORI: CRUD ------------------ */

document.getElementById("form-giocatore").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("g-nome").value.trim();
  const overall = parseInt(document.getElementById("g-overall").value, 10);
  if (!nome) return;

  const esistente = players.find(p => p.name.toLowerCase() === nome.toLowerCase());
  if (esistente) {
    esistente.overall = overall;
  } else {
    players.push({ id: uid(), name: nome, overall: overall });
  }
  savePlayers();
  document.getElementById("form-giocatore").reset();
  document.getElementById("g-overall").value = 70;
  renderTabellaGiocatori();
});

function renderTabellaGiocatori() {
  const tbody = document.querySelector("#tabella-giocatori tbody");
  tbody.innerHTML = "";
  if (players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-msg">Nessun giocatore. Aggiungine uno o importa un CSV.</td></tr>`;
    return;
  }
  const sorted = [...players].sort((a, b) => b.overall - a.overall);
  sorted.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="nome-cell">${escapeHtml(p.name)}</td>
      <td>${p.overall}</td>
      <td><button class="secondary" onclick="eliminaGiocatore('${p.id}')">Elimina</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminaGiocatore(id) {
  if (!confirm("Eliminare questo giocatore? Le partite già registrate non verranno modificate.")) return;
  players = players.filter(p => p.id !== id);
  savePlayers();
  renderTabellaGiocatori();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ------------------ NUOVA PARTITA ------------------ */

let selezioneA = new Set();
let selezioneB = new Set();

function renderPlayerPickers() {
  selezioneA = new Set();
  selezioneB = new Set();
  const pickerA = document.getElementById("picker-a");
  const pickerB = document.getElementById("picker-b");
  pickerA.innerHTML = "";
  pickerB.innerHTML = "";

  if (players.length === 0) {
    pickerA.innerHTML = `<span class="empty-msg">Aggiungi prima dei giocatori nella scheda "Giocatori".</span>`;
    pickerB.innerHTML = "";
    return;
  }

  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(p => {
    const chipA = document.createElement("span");
    chipA.className = "player-chip";
    chipA.textContent = p.name;
    chipA.dataset.id = p.id;
    chipA.addEventListener("click", () => toggleSelezione(p.id, "a"));
    pickerA.appendChild(chipA);

    const chipB = document.createElement("span");
    chipB.className = "player-chip";
    chipB.textContent = p.name;
    chipB.dataset.id = p.id;
    chipB.addEventListener("click", () => toggleSelezione(p.id, "b"));
    pickerB.appendChild(chipB);
  });

  renderMarcatoriOptions();
}

function toggleSelezione(id, squadra) {
  if (squadra === "a") {
    if (selezioneA.has(id)) selezioneA.delete(id);
    else { selezioneA.add(id); selezioneB.delete(id); }
  } else {
    if (selezioneB.has(id)) selezioneB.delete(id);
    else { selezioneB.add(id); selezioneA.delete(id); }
  }
  aggiornaChipVisuali();
  renderMarcatoriOptions();
}

function aggiornaChipVisuali() {
  document.querySelectorAll("#picker-a .player-chip").forEach(chip => {
    const id = chip.dataset.id;
    chip.classList.toggle("selected-a", selezioneA.has(id));
    chip.classList.toggle("disabled", selezioneB.has(id));
  });
  document.querySelectorAll("#picker-b .player-chip").forEach(chip => {
    const id = chip.dataset.id;
    chip.classList.toggle("selected-b", selezioneB.has(id));
    chip.classList.toggle("disabled", selezioneA.has(id));
  });
}

document.getElementById("btn-add-marcatore").addEventListener("click", () => {
  aggiungiRigaMarcatore();
});

function renderMarcatoriOptions() {
  // aggiorna le select esistenti mantenendo i valori quando possibile
  document.querySelectorAll(".marcatore-row select.sel-giocatore").forEach(sel => {
    const valorePrec = sel.value;
    popolaSelectGiocatoriInCampo(sel);
    if ([...sel.options].some(o => o.value === valorePrec)) sel.value = valorePrec;
  });
}

function popolaSelectGiocatoriInCampo(sel) {
  const inCampo = [...selezioneA, ...selezioneB];
  sel.innerHTML = "";
  if (inCampo.length === 0) {
    sel.innerHTML = `<option value="">Seleziona prima i giocatori in campo</option>`;
    return;
  }
  inCampo.forEach(id => {
    const p = players.find(pl => pl.id === id);
    if (!p) return;
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
}

function aggiungiRigaMarcatore() {
  const wrap = document.getElementById("marcatori-wrap");
  const row = document.createElement("div");
  row.className = "marcatore-row";

  const sel = document.createElement("select");
  sel.className = "sel-giocatore";
  popolaSelectGiocatoriInCampo(sel);

  const inputGol = document.createElement("input");
  inputGol.type = "number";
  inputGol.min = "1";
  inputGol.value = "1";
  inputGol.className = "input-gol";
  inputGol.placeholder = "Gol";

  const btnDel = document.createElement("button");
  btnDel.type = "button";
  btnDel.textContent = "✕";
  btnDel.addEventListener("click", () => row.remove());

  row.appendChild(sel);
  row.appendChild(inputGol);
  row.appendChild(btnDel);
  wrap.appendChild(row);
}

document.getElementById("form-partita").addEventListener("submit", e => {
  e.preventDefault();

  const data = document.getElementById("p-data").value;
  const tipo = document.getElementById("p-tipo").value;
  const scoreA = parseInt(document.getElementById("p-score-a").value, 10) || 0;
  const scoreB = parseInt(document.getElementById("p-score-b").value, 10) || 0;

  if (!data) { alert("Inserisci la data della partita."); return; }
  if (selezioneA.size === 0 || selezioneB.size === 0) {
    alert("Seleziona i giocatori per entrambe le squadre.");
    return;
  }

  const scorers = [];
  document.querySelectorAll(".marcatore-row").forEach(row => {
    const sel = row.querySelector(".sel-giocatore");
    const gol = parseInt(row.querySelector(".input-gol").value, 10) || 0;
    if (sel.value && gol > 0) {
      scorers.push({ playerId: sel.value, goals: gol });
    }
  });

  const nuovaPartita = {
    id: uid(),
    date: data,
    type: tipo,
    scoreA, scoreB,
    teamA: [...selezioneA],
    teamB: [...selezioneB],
    scorers
  };

  matches.push(nuovaPartita);
  saveMatches();

  alert("Partita salvata!");
  document.getElementById("form-partita").reset();
  document.getElementById("marcatori-wrap").innerHTML = "";
  renderPlayerPickers();
});

/* ------------------ CALCOLO CLASSIFICA ------------------ */

function calcolaStatistiche() {
  // mappa playerId -> stats
  const stats = {};
  players.forEach(p => {
    stats[p.id] = {
      id: p.id, name: p.name, overall: p.overall,
      pg: 0, v: 0, p: 0, s: 0, gol: 0, punti: 0
    };
  });

  matches.forEach(m => {
    const vincitoreA = m.scoreA > m.scoreB;
    const vincitoreB = m.scoreB > m.scoreA;
    const pareggio = m.scoreA === m.scoreB;

    m.teamA.forEach(pid => {
      if (!stats[pid]) return;
      stats[pid].pg++;
      stats[pid].punti += 1; // presenza
      if (vincitoreA) { stats[pid].v++; stats[pid].punti += 3; }
      else if (pareggio) { stats[pid].p++; }
      else { stats[pid].s++; }
    });
    m.teamB.forEach(pid => {
      if (!stats[pid]) return;
      stats[pid].pg++;
      stats[pid].punti += 1;
      if (vincitoreB) { stats[pid].v++; stats[pid].punti += 3; }
      else if (pareggio) { stats[pid].p++; }
      else { stats[pid].s++; }
    });

    (m.scorers || []).forEach(sc => {
      if (stats[sc.playerId]) stats[sc.playerId].gol += sc.goals;
    });
  });

  return Object.values(stats).sort((a, b) => b.punti - a.punti || b.gol - a.gol);
}

function renderClassifica() {
  const tbody = document.querySelector("#tabella-classifica tbody");
  tbody.innerHTML = "";
  const stats = calcolaStatistiche();

  if (stats.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-msg">Nessun dato ancora. Aggiungi giocatori e partite.</td></tr>`;
    return;
  }

  stats.forEach((s, i) => {
    const tr = document.createElement("tr");
    const posClass = i === 0 ? "pos-1" : i === 1 ? "pos-2" : i === 2 ? "pos-3" : "";
    tr.innerHTML = `
      <td class="${posClass}">${i + 1}</td>
      <td class="nome-cell">${escapeHtml(s.name)}</td>
      <td>${s.overall}</td>
      <td>${s.pg}</td>
      <td>${s.v}</td>
      <td>${s.p}</td>
      <td>${s.s}</td>
      <td>${s.gol}</td>
      <td><b>${s.punti}</b></td>
    `;
    tbody.appendChild(tr);
  });
}

/* ------------------ STORICO PARTITE ------------------ */

function nomeGiocatore(id) {
  const p = players.find(pl => pl.id === id);
  return p ? p.name : "(giocatore eliminato)";
}

function renderListaPartite() {
  const wrap = document.getElementById("lista-partite");
  wrap.innerHTML = "";

  if (matches.length === 0) {
    wrap.innerHTML = `<p class="empty-msg">Nessuna partita registrata.</p>`;
    return;
  }

  const ordinate = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));

  ordinate.forEach(m => {
    const card = document.createElement("div");
    card.className = "partita-card";

    const marcatoriTxt = (m.scorers || [])
      .map(sc => `${nomeGiocatore(sc.playerId)} (${sc.goals})`)
      .join(", ") || "Nessun marcatore registrato";

    card.innerHTML = `
      <div class="p-header">
        <span>${formatData(m.date)}</span>
        <span class="tag">${TIPO_LABELS[m.type] || m.type}</span>
      </div>
      <div class="risultato">${m.scoreA} - ${m.scoreB}</div>
      <div class="squadre-riepilogo">
        <div><span>Squadra A</span>${m.teamA.map(nomeGiocatore).join(", ")}</div>
        <div><span>Squadra B</span>${m.teamB.map(nomeGiocatore).join(", ")}</div>
      </div>
      <div class="marcatori-line"><b>Marcatori:</b> ${marcatoriTxt}</div>
      <div class="p-actions">
        <button onclick="eliminaPartita('${m.id}')">Elimina Partita</button>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function formatData(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function eliminaPartita(id) {
  if (!confirm("Eliminare questa partita?")) return;
  matches = matches.filter(m => m.id !== id);
  saveMatches();
  renderListaPartite();
}

/* ------------------ GRAFICI ------------------ */

function distruggiGrafici() {
  Object.values(charts).forEach(c => c && c.destroy());
  charts = {};
}

function renderTuttiGrafici() {
  distruggiGrafici();
  renderGraficoAndamento();
  renderGraficoMarcatori();
  renderGraficoPunti();
  renderGraficoTipi();
}

function coloreDaIndice(i) {
  const palette = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];
  return palette[i % palette.length];
}

function renderGraficoAndamento() {
  const ctx = document.getElementById("chart-andamento");
  const statsAttuali = calcolaStatistiche();
  const topPlayers = statsAttuali.slice(0, 8).map(s => s.id);

  if (topPlayers.length === 0) {
    charts.andamento = null;
    return;
  }

  const ordinate = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = ordinate.map(m => formatDataBreve(m.date));

  const puntiCumulativi = {};
  topPlayers.forEach(pid => puntiCumulativi[pid] = []);

  const cumulato = {};
  topPlayers.forEach(pid => cumulato[pid] = 0);

  ordinate.forEach(m => {
    const vincitoreA = m.scoreA > m.scoreB;
    const vincitoreB = m.scoreB > m.scoreA;
    topPlayers.forEach(pid => {
      let inA = m.teamA.includes(pid);
      let inB = m.teamB.includes(pid);
      if (inA) {
        cumulato[pid] += 1;
        if (vincitoreA) cumulato[pid] += 3;
      } else if (inB) {
        cumulato[pid] += 1;
        if (vincitoreB) cumulato[pid] += 3;
      }
      puntiCumulativi[pid].push(cumulato[pid]);
    });
  });

  const datasets = topPlayers.map((pid, i) => ({
    label: nomeGiocatore(pid),
    data: puntiCumulativi[pid],
    borderColor: coloreDaIndice(i),
    backgroundColor: coloreDaIndice(i),
    fill: false,
    tension: 0.2
  }));

  charts.andamento = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: chartOptionsBase()
  });
}

function formatDataBreve(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

function renderGraficoMarcatori() {
  const ctx = document.getElementById("chart-marcatori");
  const stats = calcolaStatistiche().filter(s => s.gol > 0).sort((a, b) => b.gol - a.gol).slice(0, 10);

  if (stats.length === 0) { charts.marcatori = null; return; }

  charts.marcatori = new Chart(ctx, {
    type: "bar",
    data: {
      labels: stats.map(s => s.name),
      datasets: [{
        label: "Gol",
        data: stats.map(s => s.gol),
        backgroundColor: "#eab308"
      }]
    },
    options: chartOptionsBase()
  });
}

function renderGraficoPunti() {
  const ctx = document.getElementById("chart-punti");
  const stats = calcolaStatistiche().slice(0, 15);

  if (stats.length === 0) { charts.punti = null; return; }

  charts.punti = new Chart(ctx, {
    type: "bar",
    data: {
      labels: stats.map(s => s.name),
      datasets: [{
        label: "Punti Campionato",
        data: stats.map(s => s.punti),
        backgroundColor: "#22c55e"
      }]
    },
    options: chartOptionsBase()
  });
}

function renderGraficoTipi() {
  const ctx = document.getElementById("chart-tipi");
  const conteggio = {};
  matches.forEach(m => {
    conteggio[m.type] = (conteggio[m.type] || 0) + 1;
  });

  const labels = Object.keys(conteggio).map(k => TIPO_LABELS[k] || k);
  const data = Object.values(conteggio);

  if (data.length === 0) { charts.tipi = null; return; }

  charts.tipi = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => coloreDaIndice(i))
      }]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: "#e2e8f0" } } } }
  });
}

function chartOptionsBase() {
  return {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: "#e2e8f0" } }
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" }, beginAtZero: true }
    }
  };
}

/* ------------------ IMPORT CSV GIOCATORI ------------------ */

document.getElementById("btn-import-csv").addEventListener("click", () => {
  const fileInput = document.getElementById("input-csv-players");
  const file = fileInput.files[0];
  const status = document.getElementById("import-status");

  if (!file) { status.textContent = "Seleziona un file CSV."; return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const testo = e.target.result;
      const righe = testo.split(/\r?\n/).filter(r => r.trim() !== "");
      let start = 0;

      // rileva se la prima riga è intestazione
      const primaRiga = righe[0].toLowerCase();
      if (primaRiga.includes("nome") || primaRiga.includes("overall")) start = 1;

      let aggiunti = 0, aggiornati = 0;

      for (let i = start; i < righe.length; i++) {
        const cols = righe[i].split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 2) continue;
        const nome = cols[0];
        const overall = parseInt(cols[1], 10);
        if (!nome || isNaN(overall)) continue;

        const esistente = players.find(p => p.name.toLowerCase() === nome.toLowerCase());
        if (esistente) {
          esistente.overall = overall;
          aggiornati++;
        } else {
          players.push({ id: uid(), name: nome, overall: overall });
          aggiunti++;
        }
      }

      savePlayers();
      renderTabellaGiocatori();
      status.textContent = `Importati ${aggiunti} nuovi, aggiornati ${aggiornati}.`;
    } catch (err) {
      status.textContent = "Errore nella lettura del file.";
      console.error(err);
    }
  };
  reader.readAsText(file, "UTF-8");
});

/* ------------------ EXPORT / IMPORT BACKUP JSON ------------------ */

document.getElementById("btn-export-json").addEventListener("click", () => {
  const backup = { players, matches, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campionato_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("btn-import-json").addEventListener("click", () => {
  const fileInput = document.getElementById("input-json");
  const file = fileInput.files[0];
  if (!file) { alert("Seleziona un file di backup JSON."); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dati = JSON.parse(e.target.result);
      if (!confirm("Questo sovrascriverà tutti i dati attuali. Continuare?")) return;
      players = dati.players || [];
      matches = dati.matches || [];
      savePlayers();
      saveMatches();
      alert("Backup importato con successo.");
      renderTabellaGiocatori();
      renderClassifica();
    } catch (err) {
      alert("File non valido.");
      console.error(err);
    }
  };
  reader.readAsText(file, "UTF-8");
});

/* ------------------ RESET DATI ------------------ */

document.getElementById("btn-reset").addEventListener("click", () => {
  if (!confirm("Sei sicuro di voler cancellare TUTTI i dati (giocatori e partite)? Operazione irreversibile.")) return;
  if (!confirm("Confermi ancora una volta? Questa azione non può essere annullata.")) return;
  players = [];
  matches = [];
  savePlayers();
  saveMatches();
  renderTabellaGiocatori();
  renderClassifica();
  alert("Dati cancellati.");
});

/* ------------------ INIT ------------------ */

document.getElementById("p-data").valueAsDate = new Date();
renderClassifica();
renderTabellaGiocatori();
aggiungiRigaMarcatore();
