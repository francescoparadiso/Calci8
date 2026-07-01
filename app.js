/* ============================================================
   SFONDO ANIMATO – PARTITA 11vs11 (4-3-3)
   ============================================================ */

class FootballBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.players = [];
        this.ball = null;
        this.passTimer = 0;
        this.passInterval = 70;
        this.targetPlayerIndex = 0;
        this.opacity = 2;
        this.playerSize = 4;
        this.ballSize = 6;
        this.speed = 1.5;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initPlayers();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    getFormation() {
        return {
            A: {
                gk: { x: 0.08, y: 0.50 },
                defenders: [
                    { x: 0.18, y: 0.25 }, { x: 0.18, y: 0.40 },
                    { x: 0.18, y: 0.60 }, { x: 0.18, y: 0.75 }
                ],
                midfielders: [
                    { x: 0.35, y: 0.30 }, { x: 0.35, y: 0.50 }, { x: 0.35, y: 0.70 }
                ],
                forwards: [
                    { x: 0.55, y: 0.25 }, { x: 0.60, y: 0.50 }, { x: 0.55, y: 0.75 }
                ]
            },
            B: {
                gk: { x: 0.92, y: 0.50 },
                defenders: [
                    { x: 0.82, y: 0.25 }, { x: 0.82, y: 0.40 },
                    { x: 0.82, y: 0.60 }, { x: 0.82, y: 0.75 }
                ],
                midfielders: [
                    { x: 0.65, y: 0.30 }, { x: 0.65, y: 0.50 }, { x: 0.65, y: 0.70 }
                ],
                forwards: [
                    { x: 0.45, y: 0.25 }, { x: 0.40, y: 0.50 }, { x: 0.45, y: 0.75 }
                ]
            }
        };
    }

    initPlayers() {
        this.players = [];
        const formation = this.getFormation();
        const teams = ['A', 'B'];
        const colors = {
            A: { primary: 'rgba(34,197,94', secondary: 'rgba(34,197,94,' },
            B: { primary: 'rgba(59,130,246', secondary: 'rgba(59,130,246,' }
        };

        teams.forEach(team => {
            const f = formation[team];
            const color = colors[team];

            this.players.push(this.createPlayer(f.gk.x, f.gk.y, color, team, 'gk', 0.03));
            f.defenders.forEach((pos, i) => {
                this.players.push(this.createPlayer(pos.x, pos.y, color, team, 'def', 0.05 + i * 0.01));
            });
            f.midfielders.forEach((pos, i) => {
                this.players.push(this.createPlayer(pos.x, pos.y, color, team, 'mid', 0.06 + i * 0.01));
            });
            f.forwards.forEach((pos, i) => {
                this.players.push(this.createPlayer(pos.x, pos.y, color, team, 'fwd', 0.07 + i * 0.01));
            });
        });

        this.ball = {
            x: 0.5, y: 0.5, vx: 0.002, vy: 0.001,
            targetX: 0.5, targetY: 0.5, size: this.ballSize, speed: 0.004
        };
        this.passTimer = 0;
        this.targetPlayerIndex = Math.floor(Math.random() * this.players.length);
        this.setBallTarget(this.targetPlayerIndex);
    }

    createPlayer(nx, ny, color, team, role, offset) {
        const x = nx + (Math.random() - 0.5) * 0.04;
        const y = ny + (Math.random() - 0.5) * 0.04;
        return {
            x, y, baseX: nx, baseY: ny,
            vx: (Math.random() - 0.5) * 0.002,
            vy: (Math.random() - 0.5) * 0.002,
            color, team, role, offset,
            phase: Math.random() * Math.PI * 2,
            size: this.playerSize + (role === 'gk' ? 2 : 0)
        };
    }

    setBallTarget(playerIndex) {
        const p = this.players[playerIndex];
        if (!p) return;
        this.ball.targetX = p.x;
        this.ball.targetY = p.y;
        this.targetPlayerIndex = playerIndex;
    }

    update() {
        const w = this.width, h = this.height;
        this.players.forEach(p => {
            const time = Date.now() / 2000;
            const oscX = Math.sin(time * 0.5 + p.phase + p.offset * 10) * 0.015;
            const oscY = Math.cos(time * 0.7 + p.phase * 1.3 + p.offset * 8) * 0.015;
            const targetX = p.baseX + oscX;
            const targetY = p.baseY + oscY;
            p.x += (targetX - p.x) * 0.02 + p.vx * 0.3;
            p.y += (targetY - p.y) * 0.02 + p.vy * 0.3;
            p.x = Math.max(0.02, Math.min(0.98, p.x));
            p.y = Math.max(0.02, Math.min(0.98, p.y));
        });

        const ball = this.ball;
        const dx = ball.targetX - ball.x;
        const dy = ball.targetY - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.003) {
            const speed = Math.min(ball.speed, dist);
            ball.x += (dx / dist) * speed;
            ball.y += (dy / dist) * speed;
        } else {
            this.passTimer++;
            if (this.passTimer > this.passInterval) {
                this.passTimer = 0;
                let newIdx;
                do {
                    newIdx = Math.floor(Math.random() * this.players.length);
                } while (newIdx === this.targetPlayerIndex && this.players.length > 1);
                this.setBallTarget(newIdx);
                ball.speed = 0.003 + Math.random() * 0.004;
            }
        }
        ball.x += (Math.random() - 0.5) * 0.0003;
        ball.y += (Math.random() - 0.5) * 0.0003;
        ball.x = Math.max(0.02, Math.min(0.98, ball.x));
        ball.y = Math.max(0.02, Math.min(0.98, ball.y));
    }

    draw() {
        const ctx = this.ctx, w = this.width, h = this.height, op = this.opacity;
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = op * 0.3;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        const pad = 0.05, lx = pad * w, ly = pad * h, rx = (1 - pad) * w, ry = (1 - pad) * h;
        ctx.strokeRect(lx, ly, rx - lx, ry - ly);
        ctx.beginPath(); ctx.moveTo(w / 2, ly); ctx.lineTo(w / 2, ry); ctx.stroke();
        ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.08, 0, Math.PI * 2); ctx.stroke();
        const areaW = w * 0.12, areaH = h * 0.3;
        ctx.strokeRect(lx, (h - areaH) / 2, areaW, areaH);
        ctx.strokeRect(rx - areaW, (h - areaH) / 2, areaW, areaH);
        ctx.restore();

        this.players.forEach(p => {
            const px = p.x * w, py = p.y * h, size = p.size * (w / 800);
            ctx.save();
            ctx.globalAlpha = op;
            const color = p.team === 'A' ? '34,197,94' : '59,130,246';
            const grad = ctx.createRadialGradient(px - size * 0.3, py - size * 0.3, 0, px, py, size);
            grad.addColorStop(0, `rgba(${color},0.9)`);
            grad.addColorStop(1, `rgba(${color},0.4)`);
            ctx.shadowColor = `rgba(${color},0.3)`;
            ctx.shadowBlur = size * 2;
            ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(255,255,255,0.15)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
        });

        const b = this.ball, bx = b.x * w, by = b.y * h, bSize = b.size * (w / 800);
        ctx.save();
        ctx.globalAlpha = op * 1.2;
        const grad = ctx.createRadialGradient(bx - bSize * 0.2, by - bSize * 0.2, 0, bx, by, bSize * 2);
        grad.addColorStop(0, 'rgba(255,255,255,0.6)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = bSize * 3;
        ctx.beginPath(); ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.shadowBlur = 0;
        const ballGrad = ctx.createRadialGradient(bx - bSize * 0.3, by - bSize * 0.3, 0, bx, by, bSize);
        ballGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        ballGrad.addColorStop(0.7, 'rgba(255,255,255,0.9)');
        ballGrad.addColorStop(1, 'rgba(220,220,220,0.7)');
        ctx.beginPath(); ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad; ctx.fill();
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const r = bSize * 0.4, px2 = bx + Math.cos(angle) * r, py2 = by + Math.sin(angle) * r;
            i === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(200,200,200,0.2)';
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = op * 0.5;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('⚽ 11vs11 · 4-3-3', w - 16, h - 10);
        ctx.restore();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const bg = new FootballBackground(canvas);
        window.__bgFootball = bg;
    }
});

/* ============================================================
   RESTO DELL'APP (con grafici corretti)
   ============================================================ */

const STORAGE_KEY_PLAYERS = "campionato_players";
const STORAGE_KEY_MATCHES = "campionato_matches";

const TIPO_LABELS = {
    calcetto: "Calcetto (5vs5)",
    calcio6: "Calcio a 6",
    calcio7: "Calcio a 7",
    calcio8: "Calcio a 8"
};

const TIPO_LIMITI = {
    calcetto: 5,
    calcio6: 6,
    calcio7: 7,
    calcio8: 8
};

let players = loadPlayers();
let matches = loadMatches();
let charts = {};

// ---- DEMO DATA ----
const DEMO_PLAYERS = [
    "Francesco Paradiso", "Davide Santucci", "Alessandro Palmegiani",
    "Cristian Cannistraci", "Marco Cannistraci", "Tiziano De Rocco",
    "Matteo Brujamonti", "Gabriele Brujamonti", "Devid", "Francesco",
    "Lorenzo", "Gianluca"
];

function seedDemoData() {
    if (players.length > 0 || matches.length > 0) return;

    DEMO_PLAYERS.forEach(name => {
        const overall = Math.floor(Math.random() * 28) + 65;
        players.push({ id: uid(), name: name.trim(), overall });
    });
    savePlayers();

    const numMatches = 8 + Math.floor(Math.random() * 5);
    const types = ["calcetto", "calcio6", "calcio7", "calcio8"];
    const dateBase = new Date();
    dateBase.setDate(dateBase.getDate() - 30);

    for (let i = 0; i < numMatches; i++) {
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const half = Math.floor(shuffled.length / 2);
        const teamA = shuffled.slice(0, half).map(p => p.id);
        const teamB = shuffled.slice(half).map(p => p.id);

        const scoreA = Math.floor(Math.random() * 5);
        const scoreB = Math.floor(Math.random() * 5);

        const date = new Date(dateBase);
        date.setDate(date.getDate() + i * 2 + Math.floor(Math.random() * 3));

        const scorers = [];
        if (teamA.length > 0) {
            const pid = teamA[Math.floor(Math.random() * teamA.length)];
            scorers.push({ playerId: pid, goals: 1 + Math.floor(Math.random() * 2), squad: 'A' });
        }
        if (teamB.length > 0) {
            const pid = teamB[Math.floor(Math.random() * teamB.length)];
            scorers.push({ playerId: pid, goals: 1 + Math.floor(Math.random() * 2), squad: 'B' });
        }
        const extra = Math.floor(Math.random() * 3);
        for (let e = 0; e < extra; e++) {
            const squad = Math.random() > 0.5 ? 'A' : 'B';
            const pool = squad === 'A' ? teamA : teamB;
            if (pool.length === 0) continue;
            const pid = pool[Math.floor(Math.random() * pool.length)];
            if (!scorers.some(s => s.playerId === pid && s.squad === squad)) {
                scorers.push({ playerId: pid, goals: 1 + Math.floor(Math.random() * 2), squad });
            }
        }

        matches.push({
            id: uid(),
            date: date.toISOString().slice(0, 10),
            type: types[Math.floor(Math.random() * types.length)],
            scoreA, scoreB, teamA, teamB, scorers
        });
    }
    saveMatches();
}

// ---- STORAGE ----
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
function savePlayers() { localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players)); }
function saveMatches() { localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function nomeGiocatore(id) {
    const p = players.find(pl => pl.id === id);
    return p ? p.name : "(eliminato)";
}

// ---- TAB NAV ----
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");

        if (btn.dataset.tab === "dashboard") { renderClassifica(); aggiornaStats(); }
        if (btn.dataset.tab === "nuova-partita") { renderPlayerPickers(); aggiornaLimite(); }
        if (btn.dataset.tab === "partite") renderListaPartite();
        if (btn.dataset.tab === "giocatori") renderTabellaGiocatori();
        if (btn.dataset.tab === "statistiche") {
            // ATTESA PIÙ LUNGA + RESIZE FORZATO
            setTimeout(() => renderTuttiGrafici(), 500);
        }
    });
});

// ---- GIOCATORI CRUD ----
document.getElementById("form-giocatore").addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("g-nome").value.trim();
    const overall = parseInt(document.getElementById("g-overall").value, 10);
    if (!nome) return;

    const esistente = players.find(p => p.name.toLowerCase() === nome.toLowerCase());
    if (esistente) {
        esistente.overall = overall;
    } else {
        players.push({ id: uid(), name: nome, overall });
    }
    savePlayers();
    document.getElementById("form-giocatore").reset();
    document.getElementById("g-overall").value = 70;
    renderTabellaGiocatori();
    aggiornaStats();
});

function renderTabellaGiocatori() {
    const tbody = document.querySelector("#tabella-giocatori tbody");
    tbody.innerHTML = "";
    if (players.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-msg">Nessun giocatore.</td></tr>`;
        return;
    }
    const sorted = [...players].sort((a, b) => b.overall - a.overall);
    sorted.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id;
        tr.innerHTML = `
          <td class="nome-cell"><span class="nome-view">${escapeHtml(p.name)}</span></td>
          <td><span class="ovr-view badge-ovr">${p.overall}</span></td>
          <td style="text-align:right;">
            <button class="btn btn-secondary btn-sm btn-edit" data-id="${p.id}">✏️ Modifica</button>
            <button class="btn btn-danger btn-sm" onclick="eliminaGiocatore('${p.id}')">Elimina</button>
          </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() { avviaModificaGiocatore(this.dataset.id); });
    });
}

function avviaModificaGiocatore(id) {
    const tr = document.querySelector(`#tabella-giocatori tbody tr[data-id="${id}"]`);
    if (!tr) return;
    const p = players.find(pl => pl.id === id);
    if (!p) return;

    const nomeView = tr.querySelector('.nome-view');
    const ovrView = tr.querySelector('.ovr-view');
    const azioniTd = tr.querySelector('td:last-child');

    const nomeInput = document.createElement('input');
    nomeInput.type = 'text'; nomeInput.value = p.name; nomeInput.className = 'edit-input nome-input';
    const ovrInput = document.createElement('input');
    ovrInput.type = 'number'; ovrInput.min = 1; ovrInput.max = 99; ovrInput.value = p.overall; ovrInput.className = 'edit-input ovr-input';

    nomeView.replaceWith(nomeInput);
    ovrView.replaceWith(ovrInput);

    const btnSalva = document.createElement('button');
    btnSalva.className = 'btn btn-sm btn-save'; btnSalva.textContent = '💾 Salva';
    const btnAnnulla = document.createElement('button');
    btnAnnulla.className = 'btn btn-sm btn-cancel'; btnAnnulla.textContent = '✕ Annulla';

    azioniTd.innerHTML = '';
    azioniTd.appendChild(btnSalva);
    azioniTd.appendChild(btnAnnulla);

    btnSalva.addEventListener('click', () => {
        const nuovoNome = nomeInput.value.trim();
        const nuovoOvr = parseInt(ovrInput.value, 10);
        if (!nuovoNome || isNaN(nuovoOvr)) { alert('Dati non validi.'); return; }
        p.name = nuovoNome; p.overall = nuovoOvr;
        savePlayers(); renderTabellaGiocatori(); aggiornaStats();
    });
    btnAnnulla.addEventListener('click', () => renderTabellaGiocatori());
}

window.eliminaGiocatore = function(id) {
    if (!confirm("Eliminare questo giocatore? Le partite rimarranno invariate.")) return;
    players = players.filter(p => p.id !== id);
    savePlayers(); renderTabellaGiocatori(); aggiornaStats();
};

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ---- NUOVA PARTITA ----
let selezioneA = new Set();
let selezioneB = new Set();

function getLimite() {
    const tipo = document.getElementById("p-tipo").value;
    return TIPO_LIMITI[tipo] || 5;
}

function aggiornaLimite() {
    const limite = getLimite();
    document.getElementById('limite-a').textContent = `${selezioneA.size}/${limite}`;
    document.getElementById('limite-b').textContent = `${selezioneB.size}/${limite}`;
    const msg = document.getElementById('limite-messaggio');
    if (selezioneA.size > limite || selezioneB.size > limite) {
        msg.style.display = 'block';
        msg.textContent = `⚠️ Limite massimo per questo tipo di partita: ${limite} giocatori per squadra.`;
    } else {
        msg.style.display = 'none';
    }
}

function renderPlayerPickers() {
    selezioneA = new Set();
    selezioneB = new Set();
    const pickerA = document.getElementById("picker-a");
    const pickerB = document.getElementById("picker-b");
    pickerA.innerHTML = ""; pickerB.innerHTML = "";

    if (players.length === 0) {
        pickerA.innerHTML = `<span class="empty-msg">Aggiungi giocatori prima.</span>`;
        pickerB.innerHTML = "";
        return;
    }

    const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(p => {
        const chipA = document.createElement("span");
        chipA.className = "player-chip"; chipA.textContent = p.name; chipA.dataset.id = p.id;
        chipA.addEventListener("click", () => toggleSelezione(p.id, "a"));
        pickerA.appendChild(chipA);

        const chipB = document.createElement("span");
        chipB.className = "player-chip"; chipB.textContent = p.name; chipB.dataset.id = p.id;
        chipB.addEventListener("click", () => toggleSelezione(p.id, "b"));
        pickerB.appendChild(chipB);
    });

    document.getElementById('marcatori-wrap-a').innerHTML = '';
    document.getElementById('marcatori-wrap-b').innerHTML = '';
    aggiornaLimite();
    aggiungiRigaMarcatore('a');
    aggiungiRigaMarcatore('b');
}

function toggleSelezione(id, squadra) {
    const limite = getLimite();
    let targetSet = squadra === 'a' ? selezioneA : selezioneB;
    let altroSet = squadra === 'a' ? selezioneB : selezioneA;

    if (altroSet.has(id)) altroSet.delete(id);

    if (targetSet.has(id)) {
        targetSet.delete(id);
    } else {
        if (targetSet.size >= limite) {
            const msg = document.getElementById('limite-messaggio');
            msg.style.display = 'block';
            msg.textContent = `⚠️ Limite massimo raggiunto (${limite}) per questa squadra.`;
            return;
        }
        targetSet.add(id);
    }
    aggiornaChipVisuali();
    aggiornaLimite();
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

document.getElementById("p-tipo").addEventListener("change", () => {
    aggiornaLimite();
    const limite = getLimite();
    if (selezioneA.size > limite) {
        [...selezioneA].slice(limite).forEach(id => selezioneA.delete(id));
    }
    if (selezioneB.size > limite) {
        [...selezioneB].slice(limite).forEach(id => selezioneB.delete(id));
    }
    aggiornaChipVisuali();
    aggiornaLimite();
    renderMarcatoriOptions();
});

document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', function() {
        aggiungiRigaMarcatore(this.dataset.target);
    });
});

function renderMarcatoriOptions() {
    document.querySelectorAll('#marcatori-wrap-a .marcatore-row select.sel-giocatore').forEach(sel => {
        const valorePrec = sel.value;
        popolaSelectGiocatoriPerSquadra(sel, 'a');
        if ([...sel.options].some(o => o.value === valorePrec)) sel.value = valorePrec;
    });
    document.querySelectorAll('#marcatori-wrap-b .marcatore-row select.sel-giocatore').forEach(sel => {
        const valorePrec = sel.value;
        popolaSelectGiocatoriPerSquadra(sel, 'b');
        if ([...sel.options].some(o => o.value === valorePrec)) sel.value = valorePrec;
    });
}

function popolaSelectGiocatoriPerSquadra(sel, squadra) {
    const inCampo = squadra === 'a' ? [...selezioneA] : [...selezioneB];
    sel.innerHTML = "";
    if (inCampo.length === 0) {
        sel.innerHTML = `<option value="">Nessuno</option>`;
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

function aggiungiRigaMarcatore(squadra) {
    const wrapId = squadra === 'a' ? 'marcatori-wrap-a' : 'marcatori-wrap-b';
    const wrap = document.getElementById(wrapId);
    const row = document.createElement("div");
    row.className = "marcatore-row";

    const sel = document.createElement("select");
    sel.className = "sel-giocatore";
    popolaSelectGiocatoriPerSquadra(sel, squadra);

    const inputGol = document.createElement("input");
    inputGol.type = "number";
    inputGol.min = "1";
    inputGol.value = "1";
    inputGol.placeholder = "Gol";

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-remove";
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

    if (!data) { alert("Inserisci la data."); return; }
    if (selezioneA.size === 0 || selezioneB.size === 0) {
        alert("Seleziona giocatori per entrambe le squadre.");
        return;
    }

    const limite = getLimite();
    if (selezioneA.size > limite || selezioneB.size > limite) {
        alert(`Numero massimo di giocatori per questo tipo di partita: ${limite}.`);
        return;
    }

    const scorers = [];
    document.querySelectorAll('#marcatori-wrap-a .marcatore-row').forEach(row => {
        const sel = row.querySelector(".sel-giocatore");
        const gol = parseInt(row.querySelector(".input-gol").value, 10) || 0;
        if (sel.value && gol > 0) {
            scorers.push({ playerId: sel.value, goals: gol, squad: 'A' });
        }
    });
    document.querySelectorAll('#marcatori-wrap-b .marcatore-row').forEach(row => {
        const sel = row.querySelector(".sel-giocatore");
        const gol = parseInt(row.querySelector(".input-gol").value, 10) || 0;
        if (sel.value && gol > 0) {
            scorers.push({ playerId: sel.value, goals: gol, squad: 'B' });
        }
    });

    matches.push({
        id: uid(),
        date: data,
        type: tipo,
        scoreA, scoreB,
        teamA: [...selezioneA],
        teamB: [...selezioneB],
        scorers
    });
    saveMatches();

    alert("✅ Partita salvata!");
    document.getElementById("form-partita").reset();
    document.getElementById('marcatori-wrap-a').innerHTML = '';
    document.getElementById('marcatori-wrap-b').innerHTML = '';
    renderPlayerPickers();
    aggiornaStats();
});

// ---- CLASSIFICA ----
function calcolaStatistiche() {
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
            stats[pid].pg++; stats[pid].punti += 1;
            if (vincitoreA) { stats[pid].v++; stats[pid].punti += 3; }
            else if (pareggio) { stats[pid].p++; }
            else { stats[pid].s++; }
        });
        m.teamB.forEach(pid => {
            if (!stats[pid]) return;
            stats[pid].pg++; stats[pid].punti += 1;
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
        tbody.innerHTML = `<tr><td colspan="9" class="empty-msg">Nessun dato disponibile.</td></tr>`;
        return;
    }
    stats.forEach((s, i) => {
        const tr = document.createElement("tr");
        const posClass = i === 0 ? "pos-1" : i === 1 ? "pos-2" : i === 2 ? "pos-3" : "";
        tr.innerHTML = `
          <td class="${posClass}">${i + 1}</td>
          <td class="nome-cell">${escapeHtml(s.name)}</td>
          <td><span class="badge-ovr">${s.overall}</span></td>
          <td>${s.pg}</td><td>${s.v}</td><td>${s.p}</td><td>${s.s}</td>
          <td>${s.gol}</td>
          <td><strong>${s.punti}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function aggiornaStats() {
    document.getElementById("stat-giocatori").textContent = players.length;
    document.getElementById("stat-partite").textContent = matches.length;
    let golTotali = 0;
    matches.forEach(m => (m.scorers || []).forEach(sc => golTotali += sc.goals));
    document.getElementById("stat-gol").textContent = golTotali;

    const stats = calcolaStatistiche();
    if (stats.length > 0) {
        const top = stats.reduce((a, b) => a.gol > b.gol ? a : b);
        document.getElementById("stat-capocannoniere").textContent = top.gol > 0 ? top.name : "—";
    } else {
        document.getElementById("stat-capocannoniere").textContent = "—";
    }
}

// ---- LISTA PARTITE ----
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

        const ovrA = m.teamA.reduce((sum, pid) => sum + (players.find(pl => pl.id === pid)?.overall || 0), 0);
        const ovrB = m.teamB.reduce((sum, pid) => sum + (players.find(pl => pl.id === pid)?.overall || 0), 0);
        const maxOvr = Math.max(ovrA, ovrB, 1);
        const percentA = (ovrA / maxOvr) * 100;
        const percentB = (ovrB / maxOvr) * 100;

        const marcatoriA = (m.scorers || []).filter(sc => sc.squad === 'A');
        const marcatoriB = (m.scorers || []).filter(sc => sc.squad === 'B');
        const txtA = marcatoriA.map(sc => `${nomeGiocatore(sc.playerId)} (${sc.goals})`).join(', ') || 'Nessuno';
        const txtB = marcatoriB.map(sc => `${nomeGiocatore(sc.playerId)} (${sc.goals})`).join(', ') || 'Nessuno';

        card.innerHTML = `
          <div class="p-header">
            <span class="p-date">${formatData(m.date)}</span>
            <span class="p-tag">${TIPO_LABELS[m.type] || m.type}</span>
          </div>
          <div class="risultato">
            <span class="score-a">${m.scoreA}</span>
            <span class="score-divider">—</span>
            <span class="score-b">${m.scoreB}</span>
          </div>
          <div class="squadre-riepilogo">
            <div class="sq-a">
              <span class="sq-label">🟢 Squadra A</span>
              <div class="sq-players">${m.teamA.map(nomeGiocatore).join(", ")}</div>
              <div class="sq-ovr"><span class="ovr-label">OVR</span> ${ovrA}</div>
            </div>
            <div class="sq-b">
              <span class="sq-label">🔵 Squadra B</span>
              <div class="sq-players">${m.teamB.map(nomeGiocatore).join(", ")}</div>
              <div class="sq-ovr"><span class="ovr-label">OVR</span> ${ovrB}</div>
            </div>
          </div>
          <div class="sq-ovr-bar">
            <div class="bar-a" style="width:${percentA}%;"></div>
            <div class="bar-b" style="width:${percentB}%;"></div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:6px 0; font-size:0.75rem; color:var(--text-secondary);">
            <div><span style="color:var(--accent-green);">A</span> ${txtA}</div>
            <div><span style="color:var(--accent-blue);">B</span> ${txtB}</div>
          </div>
          <div class="p-actions">
            <button class="btn btn-danger btn-sm" onclick="eliminaPartita('${m.id}')">Elimina</button>
          </div>
        `;
        wrap.appendChild(card);
    });
}

function formatData(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

window.eliminaPartita = function(id) {
    if (!confirm("Eliminare questa partita?")) return;
    matches = matches.filter(m => m.id !== id);
    saveMatches(); renderListaPartite(); aggiornaStats();
};

// ---- GRAFICI (CORRETTI) ----
function distruggiGrafici() {
    Object.values(charts).forEach(c => c && c.destroy());
    charts = {};
}

function renderTuttiGrafici() {
    distruggiGrafici();

    // ---- FORZA DIMENSIONI VISIBILI ----
    const canvases = ['chart-andamento', 'chart-marcatori', 'chart-punti', 'chart-tipi'];
    canvases.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const container = canvas.parentElement;
            const w = container.clientWidth || 400;
            canvas.width = w;
            canvas.height = 220;
            canvas.style.width = w + 'px';
            canvas.style.height = '220px';
        }
    });

    // ---- ASPETTA CHE LA TAB SIA COMPLETAMENTE VISIBILE ----
    setTimeout(() => {
        renderGraficoAndamento();
        renderGraficoMarcatori();
        renderGraficoPunti();
        renderGraficoTipi();
        
        // Forza il resize di ogni grafico
        setTimeout(() => {
            Object.values(charts).forEach(c => {
                if (c && c.resize) c.resize();
            });
        }, 100);
    }, 400);
}

function coloreDaIndice(i) {
    const palette = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];
    return palette[i % palette.length];
}

function chartOptionsBase() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                labels: { color: "#94a3b8", font: { size: 10 }, boxWidth: 12, padding: 12 }
            }
        },
        scales: {
            x: {
                ticks: { color: "#64748b", font: { size: 9 } },
                grid: { color: "rgba(255,255,255,0.04)" }
            },
            y: {
                ticks: { color: "#64748b", font: { size: 9 } },
                grid: { color: "rgba(255,255,255,0.04)" },
                beginAtZero: true
            }
        }
    };
}

function renderGraficoAndamento() {
    const ctx = document.getElementById("chart-andamento");
    if (!ctx) return;
    const statsAttuali = calcolaStatistiche();
    const topPlayers = statsAttuali.slice(0, 8).map(s => s.id);
    if (topPlayers.length === 0 || matches.length === 0) return;

    const ordinate = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = ordinate.map(m => formatDataBreve(m.date));
    const cumulato = {}; topPlayers.forEach(pid => cumulato[pid] = 0);
    const puntiCumulativi = {}; topPlayers.forEach(pid => puntiCumulativi[pid] = []);

    ordinate.forEach(m => {
        const vincitoreA = m.scoreA > m.scoreB;
        const vincitoreB = m.scoreB > m.scoreA;
        topPlayers.forEach(pid => {
            if (m.teamA.includes(pid)) { cumulato[pid] += 1; if (vincitoreA) cumulato[pid] += 3; }
            else if (m.teamB.includes(pid)) { cumulato[pid] += 1; if (vincitoreB) cumulato[pid] += 3; }
            puntiCumulativi[pid].push(cumulato[pid]);
        });
    });

    charts.andamento = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: topPlayers.map((pid, i) => ({
                label: nomeGiocatore(pid),
                data: puntiCumulativi[pid],
                borderColor: coloreDaIndice(i),
                backgroundColor: coloreDaIndice(i) + "33",
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                borderWidth: 2
            }))
        },
        options: chartOptionsBase()
    });
}

function formatDataBreve(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

function renderGraficoMarcatori() {
    const ctx = document.getElementById("chart-marcatori");
    if (!ctx) return;
    const stats = calcolaStatistiche().filter(s => s.gol > 0).sort((a, b) => b.gol - a.gol).slice(0, 10);
    if (stats.length === 0) return;
    charts.marcatori = new Chart(ctx, {
        type: "bar",
        data: {
            labels: stats.map(s => s.name),
            datasets: [{
                label: "Gol",
                data: stats.map(s => s.gol),
                backgroundColor: stats.map((_, i) => coloreDaIndice(i)),
                borderRadius: 6
            }]
        },
        options: chartOptionsBase()
    });
}

function renderGraficoPunti() {
    const ctx = document.getElementById("chart-punti");
    if (!ctx) return;
    const stats = calcolaStatistiche().slice(0, 15);
    if (stats.length === 0) return;
    charts.punti = new Chart(ctx, {
        type: "bar",
        data: {
            labels: stats.map(s => s.name),
            datasets: [{
                label: "Punti",
                data: stats.map(s => s.punti),
                backgroundColor: stats.map((_, i) => coloreDaIndice(i)),
                borderRadius: 6
            }]
        },
        options: chartOptionsBase()
    });
}

function renderGraficoTipi() {
    const ctx = document.getElementById("chart-tipi");
    if (!ctx) return;
    const conteggio = {};
    matches.forEach(m => { conteggio[m.type] = (conteggio[m.type] || 0) + 1; });
    const labels = Object.keys(conteggio).map(k => TIPO_LABELS[k] || k);
    const data = Object.values(conteggio);
    if (data.length === 0) return;
    charts.tipi = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: labels.map((_, i) => coloreDaIndice(i)),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#94a3b8", font: { size: 11 } }
                }
            }
        }
    });
}

// ---- IMPORT/EXPORT/RESET ----
document.getElementById("btn-import-csv").addEventListener("click", () => {
    const file = document.getElementById("input-csv-players").files[0];
    const status = document.getElementById("import-status");
    if (!file) { status.textContent = "Seleziona un file CSV."; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const righe = e.target.result.split(/\r?\n/).filter(r => r.trim() !== "");
            let start = 0;
            if (righe[0].toLowerCase().includes("nome")) start = 1;
            let aggiunti = 0, aggiornati = 0;
            for (let i = start; i < righe.length; i++) {
                const cols = righe[i].split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ""));
                if (cols.length < 2) continue;
                const nome = cols[0], overall = parseInt(cols[1], 10);
                if (!nome || isNaN(overall)) continue;
                const esistente = players.find(p => p.name.toLowerCase() === nome.toLowerCase());
                if (esistente) { esistente.overall = overall; aggiornati++; }
                else { players.push({ id: uid(), name: nome, overall }); aggiunti++; }
            }
            savePlayers(); renderTabellaGiocatori(); aggiornaStats();
            status.textContent = `✅ Importati ${aggiunti}, aggiornati ${aggiornati}.`;
        } catch (err) { status.textContent = "❌ Errore lettura."; console.error(err); }
    };
    reader.readAsText(file, "UTF-8");
});

document.getElementById("btn-export-json").addEventListener("click", () => {
    const backup = { players, matches, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `campionato_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
});

document.getElementById("btn-import-json").addEventListener("click", () => {
    const file = document.getElementById("input-json").files[0];
    if (!file) { alert("Seleziona un file JSON."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dati = JSON.parse(e.target.result);
            if (!confirm("Sovrascrivere tutti i dati?")) return;
            players = dati.players || []; matches = dati.matches || [];
            savePlayers(); saveMatches();
            alert("✅ Backup importato.");
            renderTabellaGiocatori(); renderClassifica(); aggiornaStats();
        } catch (err) { alert("❌ File non valido."); }
    };
    reader.readAsText(file, "UTF-8");
});

document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("Cancellare TUTTI i dati?") || !confirm("Confermi davvero?")) return;
    players = []; matches = [];
    savePlayers(); saveMatches();
    renderTabellaGiocatori(); renderClassifica(); aggiornaStats();
    alert("Dati cancellati.");
});

// ---- INIT ----
seedDemoData();
document.getElementById("p-data").valueAsDate = new Date();
renderClassifica();
renderTabellaGiocatori();
aggiornaStats();

setTimeout(() => {
    if (players.length > 0) {
        aggiungiRigaMarcatore('a');
        aggiungiRigaMarcatore('b');
    }
    if (document.getElementById('statistiche').classList.contains('active')) {
        renderTuttiGrafici();
    }
}, 150);

console.log("⚽ Campionato tra Amici — pronto!");