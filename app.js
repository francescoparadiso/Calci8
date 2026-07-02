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
        this.passInterval = 60;
        this.targetPlayerIndex = 0;
        this.opacity = 1;
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
            A: { primary: 'rgba(212,160,23', secondary: 'rgba(212,160,23,' },
            B: { primary: 'rgba(147,73,60', secondary: 'rgba(147,73,60,' }
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
            const color = p.team === 'A' ? '212,160,23' : '147,73,60';
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

/* ============================================================
   SUPABASE CLIENT – dichiarazione unica (rinominata)
   ============================================================ */
const supabaseUrl = 'https://twrlfnxhoycyszurrfsk.supabase.co';
const supabaseKey = 'sb_publishable_DpNa1qNeB7XVyXw59sR-xA_Y4QN1s_I';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

/* ============================================================
   APP PRINCIPALE
   ============================================================ */

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

let players = [];
let matches = [];
let charts = {};
let classificaViewMode = 'tabella';
let sortColumn = 'punti';
let sortDirection = 'desc';
let editMatchId = null;

// ---- TOAST ----
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ---- AVATAR COLORI ----
function getPlayerColor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ---- DEMO DATA (async) ----
const DEMO_PLAYERS = [
    "Francesco Paradiso", "Davide Santucci", "Alessandro Palmegiani",
    "Cristian Cannistraci", "Marco Cannistraci", "Tiziano De Rocco",
    "Matteo Brujamonti", "Gabriele Brujamonti", "Devid", "Francesco",
    "Lorenzo", "Gianluca"
];

async function seedDemoData() {
    if (players.length > 0 || matches.length > 0) return;

    // --- 1. CREA GIOCATORI DEMO ---
    const DEMO_PLAYERS = [
        "Francesco Paradiso", "Davide Santucci", "Alessandro Palmegiani",
        "Cristian Cannistraci", "Marco Cannistraci", "Tiziano De Rocco",
        "Matteo Brujamonti", "Gabriele Brujamonti", "Devid", "Francesco",
        "Lorenzo", "Gianluca"
    ];

    DEMO_PLAYERS.forEach(name => {
        const overall = Math.floor(Math.random() * 28) + 65;
        players.push({ id: uid(), name: name.trim(), overall });
    });

    // --- 2. GENERA PARTITE CASUALI CON MARCATORI COERENTI ---
    const numMatches = 8 + Math.floor(Math.random() * 5);
    const types = ["calcetto", "calcio6", "calcio7", "calcio8"];
    const dateBase = new Date();
    dateBase.setDate(dateBase.getDate() - 30);

    for (let i = 0; i < numMatches; i++) {
        // --- 2a. Formazione squadre ---
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const half = Math.floor(shuffled.length / 2);
        const teamA = shuffled.slice(0, half).map(p => p.id);
        const teamB = shuffled.slice(half).map(p => p.id);

        // --- 2b. Punteggi casuali (0–5) ---
        const scoreA = Math.floor(Math.random() * 5);
        const scoreB = Math.floor(Math.random() * 5);

        // --- 2c. Data ---
        const date = new Date(dateBase);
        date.setDate(date.getDate() + i * 2 + Math.floor(Math.random() * 3));

        // --- 2d. GENERA MARCATORI COERENTI ---
        const scorers = [];

        // Funzione helper: assegna 'totalGoals' gol a giocatori di una squadra
        function assegnaGol(teamIds, totalGoals, squadLabel) {
            if (totalGoals === 0 || teamIds.length === 0) return;
            // Crea una copia mescolata dei giocatori
            const pool = [...teamIds].sort(() => Math.random() - 0.5);
            let remaining = totalGoals;
            let idx = 0;
            while (remaining > 0) {
                // Se abbiamo esaurito i giocatori, ricomincia da capo (ma è raro)
                if (idx >= pool.length) {
                    idx = 0;
                    // Mescola di nuovo per variare
                    pool.sort(() => Math.random() - 0.5);
                }
                const pid = pool[idx];
                // Decidi quanti gol assegnare a questo giocatore (1 o 2, ma mai più di remaining)
                const maxGol = Math.min(remaining, 2);
                const goals = Math.floor(Math.random() * maxGol) + 1;
                scorers.push({ playerId: pid, goals: goals, squad: squadLabel });
                remaining -= goals;
                idx++;
            }
        }

        assegnaGol(teamA, scoreA, 'A');
        assegnaGol(teamB, scoreB, 'B');

        // --- 2e. Salva la partita ---
        matches.push({
            id: uid(),
            date: date.toISOString().slice(0, 10),
            type: types[Math.floor(Math.random() * types.length)],
            scoreA, scoreB,
            teamA, teamB,
            scorers
        });
    }

    await savePlayers();
    await saveMatches();
}

// ---- STORAGE SUPABASE (usando supabaseClient) ----
async function loadPlayers() {
    const { data, error } = await supabaseClient
        .from('players')
        .select('*');
    if (error) {
        console.error(error);
        showToast('Errore nel caricare i giocatori: ' + error.message, 'error');
        return [];
    }
    // Assicura che ogni giocatore abbia le statistiche (genera casuali se mancano)
    data.forEach(p => {
        if (p.attack === undefined || p.attack === null) {
            p.attack = Math.floor(Math.random() * 40) + 40; // 40–80
            p.defense = Math.floor(Math.random() * 40) + 40;
            p.pace = Math.floor(Math.random() * 40) + 40;
            p.stamina = Math.floor(Math.random() * 40) + 40;
            p.shooting = Math.floor(Math.random() * 40) + 40;
            p.control = Math.floor(Math.random() * 40) + 40;
            // Salva subito per non perdere i nuovi valori
            supabaseClient.from('players').upsert(p, { onConflict: 'id' }).then();
        }
    });
    return data || [];
}

async function loadMatches() {
    const { data, error } = await supabaseClient
        .from('matches')
        .select('*');
    if (error) {
        console.error(error);
        showToast('Errore nel caricare le partite: ' + error.message, 'error');
        return [];
    }
    return data || [];
}

async function savePlayers() {
    const { error } = await supabaseClient
        .from('players')
        .upsert(players, { onConflict: 'id' });
    if (error) {
        console.error(error);
        showToast('Errore nel salvare i giocatori: ' + error.message, 'error');
    }
}

async function saveMatches() {
    const { error } = await supabaseClient
        .from('matches')
        .upsert(matches, { onConflict: 'id' });
    if (error) {
        console.error(error);
        showToast('Errore nel salvare le partite: ' + error.message, 'error');
    }
}

// ---- UTILITY ----
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function nomeGiocatore(id) {
    const p = players.find(pl => pl.id === id);
    return p ? p.name : "(eliminato)";
}

function formatData(iso) {
    if (!iso) return 'Data non valida';
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDataBreve(iso) {
    if (!iso) return '';
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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
        if (btn.dataset.tab === "giocatori") renderGiocatoriGrid();
        if (btn.dataset.tab === "statistiche") {
            setTimeout(() => renderTuttiGrafici(), 400);
        }
    });
});

// ---- GIOCATORI CRUD ----
document.getElementById("form-giocatore").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("g-nome").value.trim();
    const overall = parseInt(document.getElementById("g-overall").value, 10);
    const attack = parseInt(document.getElementById("g-attack").value, 10) || 50;
    const defense = parseInt(document.getElementById("g-defense").value, 10) || 50;
    const pace = parseInt(document.getElementById("g-pace").value, 10) || 50;
    const stamina = parseInt(document.getElementById("g-stamina").value, 10) || 50;
    const shooting = parseInt(document.getElementById("g-shooting").value, 10) || 50;
    const control = parseInt(document.getElementById("g-control").value, 10) || 50;
    const editId = document.getElementById("edit-player-id").value;
    const photoUrl = document.getElementById('g-photo-url').value.trim() || null;
    if (!nome) return;

if (editId) {
    const idx = players.findIndex(p => p.id === editId);
    if (idx !== -1) {
        players[idx] = {
            ...players[idx],
            name: nome,
            overall,
            attack, defense, pace, stamina, shooting, control,
            photo_url: photoUrl  // <-- AGGIUNGI QUESTA RIGA
        };
        await savePlayers();
        showToast('✅ Giocatore aggiornato!', 'success');
        document.getElementById('edit-player-id').value = '';
        document.querySelector('#form-giocatore .btn').textContent = '➕ Aggiungi / Aggiorna';
    }
} else {
        // AGGIUNTA
        const esistente = players.find(p => p.name.toLowerCase() === nome.toLowerCase());
        if (esistente) {
            // Se esiste, aggiorna
            esistente.overall = overall;
            esistente.attack = attack;
            esistente.defense = defense;
            esistente.pace = pace;
            esistente.stamina = stamina;
            esistente.shooting = shooting;
            esistente.control = control;
            await savePlayers();
            showToast(`Giocatore ${nome} aggiornato`, 'info');
        } else {
            players.push({
                id: uid(),
                name: nome,
                overall,
                attack, defense, pace, stamina, shooting, control,
                photo_url: photoUrl  // <-- AGGIUNTO
            });
            await savePlayers();
            showToast(`Giocatore ${nome} aggiunto!`, 'success');
        }
    }

    // Reset form e ricarica
    document.getElementById("form-giocatore").reset();
    document.getElementById("g-overall").value = 70;
    document.getElementById("g-attack").value = 50;
    document.getElementById("g-defense").value = 50;
    document.getElementById("g-pace").value = 50;
    document.getElementById("g-stamina").value = 50;
    document.getElementById("g-shooting").value = 50;
    document.getElementById("g-control").value = 50;
    document.getElementById('edit-player-id').value = '';
    document.querySelector('#form-giocatore .btn').textContent = '➕ Aggiungi / Aggiorna';
    renderGiocatoriGrid();
    aggiornaStats();
});

function calcolaBadgeGiocatori() {
    const stats = calcolaStatistiche('all');
    const badgeMap = {};
    stats.forEach(s => { badgeMap[s.id] = []; });

    const maxGol = Math.max(0, ...stats.map(s => s.gol));
    const maxCleanSheets = Math.max(0, ...stats.map(s => s.cleanSheets || 0));
    const maxPg = Math.max(0, ...stats.map(s => s.pg));

    if (maxGol > 0) {
        stats.filter(s => s.gol === maxGol).forEach(s => badgeMap[s.id].push({ icon: '🥇', label: 'Capocannoniere' }));
    }
    if (maxCleanSheets > 0) {
        stats.filter(s => (s.cleanSheets || 0) === maxCleanSheets).forEach(s => badgeMap[s.id].push({ icon: '🧤', label: 'Miglior difesa' }));
    }
    if (maxPg > 0) {
        stats.filter(s => s.pg === maxPg).forEach(s => badgeMap[s.id].push({ icon: '🏃', label: 'Più partite giocate' }));
    }

    return badgeMap;
}

function renderGiocatoriGrid() {
    const grid = document.getElementById('giocatori-grid');
    grid.innerHTML = '';
    if (players.length === 0) {
        grid.innerHTML = `<p class="empty-msg">Nessun giocatore. Aggiungine uno!</p>`;
        return;
    }

    const sorted = [...players].sort((a, b) => b.overall - a.overall);
    const badgeMap = calcolaBadgeGiocatori();
    sorted.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.id = p.id;

        // SFONDO IMMAGINE
        if (p.photo_url) {
            card.style.backgroundImage = `url("${p.photo_url}")`;
        } else {
            // Colore di fallback se non c'è foto
            const color = getPlayerColor(p.id);
            card.style.background = `linear-gradient(135deg, ${color}33, ${color}cc)`;
        }

        const pos = calcolaPosizione(p);
        const badges = badgeMap[p.id] || [];
        const badgesHtml = badges.length > 0
            ? `<div class="card-badges">${badges.map(b => `<span class="player-badge" title="${b.label}">${b.icon} ${b.label}</span>`).join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="card-ovr-badge">${p.overall}</div>
            <div class="card-name">${escapeHtml(p.name)}</div>
            <div class="card-position">${pos}</div>
            ${badgesHtml}
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">ATT</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.attack}%; background:#ef4444;"></div></div>
                    <span class="stat-value">${p.attack}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">DIF</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.defense}%; background:#93493c;"></div></div>
                    <span class="stat-value">${p.defense}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">VEL</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.pace}%; background:#d4a017;"></div></div>
                    <span class="stat-value">${p.pace}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">RES</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.stamina}%; background:#eab308;"></div></div>
                    <span class="stat-value">${p.stamina}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">TIRO</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.shooting}%; background:#f97316;"></div></div>
                    <span class="stat-value">${p.shooting}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">CONT</span>
                    <div class="stat-bar"><div class="stat-fill" style="width:${p.control}%; background:#8b5cf6;"></div></div>
                    <span class="stat-value">${p.control}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm btn-edit-card" data-id="${p.id}">✏️ Modifica</button>
                <button class="btn btn-danger btn-sm" onclick="eliminaGiocatore('${p.id}')">🗑️</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.btn-edit-card').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            apriModaleModificaGiocatore(id);
        });
    });
}
function calcolaPosizione(p) {
    const att = p.attack || 50;
    const dif = p.defense || 50;
    if (att > dif + 15) return '⚡ Attaccante';
    if (dif > att + 15) return '🛡️ Difensore';
    return '🎯 Centrocampista';
}

function apriModaleModificaGiocatore(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;

    // Popola il form di aggiunta
    document.getElementById('g-nome').value = p.name;
    document.getElementById('g-overall').value = p.overall;
    document.getElementById('g-attack').value = p.attack || 50;
    document.getElementById('g-defense').value = p.defense || 50;
    document.getElementById('g-pace').value = p.pace || 50;
    document.getElementById('g-stamina').value = p.stamina || 50;
    document.getElementById('g-shooting').value = p.shooting || 50;
    document.getElementById('g-control').value = p.control || 50;
    document.getElementById('edit-player-id').value = id;

    // Cambia il testo del bottone
    document.querySelector('#form-giocatore .btn').textContent = '💾 Aggiorna Giocatore';

    // Scroll fino al form
    document.getElementById('form-giocatore').scrollIntoView({ behavior: 'smooth' });
    // Dopo aver popolato nome, overall, stats...
    document.getElementById('g-photo-url').value = p.photo_url || '';
    const previewDiv = document.getElementById('photo-preview');
    const previewImg = document.getElementById('photo-preview-img');
    if (p.photo_url) {
        previewImg.src = p.photo_url;
        previewDiv.style.display = 'flex';
    } else {
        previewDiv.style.display = 'none';
    }
}
window.eliminaGiocatore = async function (id) {
    if (!confirm("Eliminare questo giocatore? Le partite rimarranno invariate.")) return;
    players = players.filter(p => p.id !== id);
    await savePlayers();
    renderGiocatoriGrid();
    aggiornaStats();
    showToast('Giocatore eliminato', 'info');
};

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
        const color = getPlayerColor(p.id);
        const initials = getInitials(p.name);
        const chipA = document.createElement("span");
        chipA.className = "player-chip";
        chipA.innerHTML = `<span class="player-avatar player-avatar-sm" style="background:${color}; width:20px; height:20px; line-height:20px; font-size:0.5rem; margin-right:4px;">${initials}</span>${p.name}`;
        chipA.dataset.id = p.id;
        chipA.addEventListener("click", () => toggleSelezione(p.id, "a"));
        pickerA.appendChild(chipA);

        const chipB = document.createElement("span");
        chipB.className = "player-chip";
        chipB.innerHTML = `<span class="player-avatar player-avatar-sm" style="background:${color}; width:20px; height:20px; line-height:20px; font-size:0.5rem; margin-right:4px;">${initials}</span>${p.name}`;
        chipB.dataset.id = p.id;
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
    btn.addEventListener('click', function () {
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
    inputGol.className = "input-gol";
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

// ---- SALVATAGGIO PARTITA ----
document.getElementById("form-partita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = document.getElementById("p-data").value;
    const tipo = document.getElementById("p-tipo").value;
    const scoreA = parseInt(document.getElementById("p-score-a").value, 10) || 0;
    const scoreB = parseInt(document.getElementById("p-score-b").value, 10) || 0;

    if (!data) { showToast('Inserisci la data.', 'error'); return; }
    if (selezioneA.size === 0 || selezioneB.size === 0) {
        showToast('Seleziona giocatori per entrambe le squadre.', 'error');
        return;
    }

    const limite = getLimite();
    if (selezioneA.size > limite || selezioneB.size > limite) {
        showToast(`Numero massimo di giocatori per questo tipo di partita: ${limite}.`, 'error');
        return;
    }

    const scorers = [];
    let totalGolA = 0;
    let totalGolB = 0;

    document.querySelectorAll('#marcatori-wrap-a .marcatore-row').forEach(row => {
        const sel = row.querySelector(".sel-giocatore");
        const inputGol = row.querySelector(".input-gol");
        if (!inputGol) return;
        const gol = parseInt(inputGol.value, 10) || 0;
        if (sel && sel.value && gol > 0) {
            scorers.push({ playerId: sel.value, goals: gol, squad: 'A' });
            totalGolA += gol;
        }
    });

    document.querySelectorAll('#marcatori-wrap-b .marcatore-row').forEach(row => {
        const sel = row.querySelector(".sel-giocatore");
        const inputGol = row.querySelector(".input-gol");
        if (!inputGol) return;
        const gol = parseInt(inputGol.value, 10) || 0;
        if (sel && sel.value && gol > 0) {
            scorers.push({ playerId: sel.value, goals: gol, squad: 'B' });
            totalGolB += gol;
        }
    });

    if (totalGolA !== scoreA) {
        showToast(`⚠️ I gol della Squadra A non corrispondono: risultato ${scoreA}, marcatori totali ${totalGolA}.`, 'error');
        return;
    }
    if (totalGolB !== scoreB) {
        showToast(`⚠️ I gol della Squadra B non corrispondono: risultato ${scoreB}, marcatori totali ${totalGolB}.`, 'error');
        return;
    }

    if (editMatchId) {
        const idx = matches.findIndex(m => m.id === editMatchId);
        if (idx !== -1) {
            matches[idx] = {
                id: editMatchId,
                date: data,
                type: tipo,
                scoreA, scoreB,
                teamA: [...selezioneA],
                teamB: [...selezioneB],
                scorers
            };
            await saveMatches();
            showToast('✅ Partita aggiornata!', 'success');
            editMatchId = null;
            document.getElementById('edit-match-id').value = '';
            document.getElementById('btn-salva-partita').textContent = '💾 Salva Partita';
            document.getElementById('btn-annulla-modifica').style.display = 'none';
        }
    } else {
        matches.push({
            id: uid(),
            date: data,
            type: tipo,
            scoreA, scoreB,
            teamA: [...selezioneA],
            teamB: [...selezioneB],
            scorers
        });
        await saveMatches();
        showToast('✅ Partita salvata!', 'success');
    }

    document.getElementById("form-partita").reset();
    document.getElementById("p-data").valueAsDate = new Date();
    document.getElementById('marcatori-wrap-a').innerHTML = '';
    document.getElementById('marcatori-wrap-b').innerHTML = '';
    renderPlayerPickers();
    aggiornaStats();
    if (document.getElementById('partite').classList.contains('active')) {
        renderListaPartite();
    }
});

// ---- ANNULLA MODIFICA ----
document.getElementById('btn-annulla-modifica').addEventListener('click', () => {
    editMatchId = null;
    document.getElementById('edit-match-id').value = '';
    document.getElementById('btn-salva-partita').textContent = '💾 Salva Partita';
    document.getElementById('btn-annulla-modifica').style.display = 'none';
    document.getElementById('form-partita').reset();
    document.getElementById("p-data").valueAsDate = new Date();
    document.getElementById('marcatori-wrap-a').innerHTML = '';
    document.getElementById('marcatori-wrap-b').innerHTML = '';
    renderPlayerPickers();
    showToast('Modifica annullata', 'info');
});

// ---- FILTRO PER TIPO ----
document.getElementById('filtro-tipo').addEventListener('change', () => {
    renderClassifica();
});

// ---- FORMA GIOCATORE (ultime 5 partite) ----
function calcolaFormaGiocatore(playerId, filtroTipo = null) {
    const partiteFiltrate = filtroTipo && filtroTipo !== 'all'
        ? matches.filter(m => m.type === filtroTipo)
        : matches;

    const partiteGiocatore = partiteFiltrate
        .filter(m => m.teamA.includes(playerId) || m.teamB.includes(playerId))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    let win = 0, loss = 0;
    partiteGiocatore.forEach(m => {
        const inA = m.teamA.includes(playerId);
        const vincitoreA = m.scoreA > m.scoreB;
        const vincitoreB = m.scoreB > m.scoreA;
        if (inA && vincitoreA) win++;
        else if (!inA && vincitoreB) win++;
        else if (m.scoreA !== m.scoreB) loss++;
    });

    return { win, loss, giocate: partiteGiocatore.length };
}

// ---- CLASSIFICA ----
function calcolaStatistiche(filtroTipo = null) {
    const stats = {};
    players.forEach(p => {
        stats[p.id] = {
            id: p.id, name: p.name, overall: p.overall,
            pg: 0, v: 0, p: 0, s: 0, gol: 0, punti: 0,
            assists: 0, cleanSheets: 0
        };
    });

    const partiteFiltrate = filtroTipo && filtroTipo !== 'all'
        ? matches.filter(m => m.type === filtroTipo)
        : matches;

    partiteFiltrate.forEach(m => {
        const vincitoreA = m.scoreA > m.scoreB;
        const vincitoreB = m.scoreB > m.scoreA;
        const pareggio = m.scoreA === m.scoreB;

        if (vincitoreA && m.scoreB === 0) {
            m.teamA.forEach(pid => { if (stats[pid]) stats[pid].cleanSheets++; });
        }
        if (vincitoreB && m.scoreA === 0) {
            m.teamB.forEach(pid => { if (stats[pid]) stats[pid].cleanSheets++; });
        }

        m.teamA.forEach(pid => {
            if (!stats[pid]) return;
            stats[pid].pg++;
            stats[pid].punti += 1;
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

    return Object.values(stats);
}

function renderClassifica() {
    if (classificaViewMode === 'grafico') {
        renderClassificaChart();
        return;
    }
    const filtro = document.getElementById('filtro-tipo').value;
    const stats = calcolaStatistiche(filtro);

    stats.sort((a, b) => {
        let valA = a[sortColumn] || 0;
        let valB = b[sortColumn] || 0;
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const tbody = document.querySelector("#tabella-classifica tbody");
    tbody.innerHTML = "";
    if (stats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-msg">Nessun dato disponibile.</td></tr>`;
        return;
    }
    stats.forEach((s, i) => {
        const tr = document.createElement("tr");
        const posClass = i === 0 ? "pos-1" : i === 1 ? "pos-2" : i === 2 ? "pos-3" : "";
        const color = getPlayerColor(s.id);
        const initials = getInitials(s.name);
        tr.innerHTML = `
          <td class="${posClass}">${i + 1}</td>
          <td class="nome-cell" data-player-id="${s.id}" style="cursor:pointer;">
            <span class="player-avatar player-avatar-sm" style="background:${color};">${initials}</span>
            ${escapeHtml(s.name)}
          </td>
          <td><span class="badge-ovr">${s.overall}</span></td>
          <td>${s.pg}</td><td>${s.v}</td><td>${s.p}</td><td>${s.s}</td>
          <td>${s.gol}</td>
          <td><strong>${s.punti}</strong></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('#tabella-classifica tbody td.nome-cell').forEach(td => {
        td.addEventListener('click', function () {
            const id = this.dataset.playerId;
            apriModalGiocatore(id);
        });
    });
}

// ---- TOGGLE VISTA CLASSIFICA (Tabella / Grafico) ----
document.querySelectorAll('#classifica-view-toggle .tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('#classifica-view-toggle .tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        classificaViewMode = this.dataset.view;
        const tableWrap = document.getElementById('classifica-table-wrap');
        const chartWrap = document.getElementById('classifica-chart-wrap');
        if (classificaViewMode === 'grafico') {
            tableWrap.style.display = 'none';
            chartWrap.style.display = 'block';
        } else {
            tableWrap.style.display = '';
            chartWrap.style.display = 'none';
        }
        renderClassifica();
    });
});

function renderClassificaChart() {
    const canvas = document.getElementById('chart-classifica');
    if (!canvas) return;
    const filtro = document.getElementById('filtro-tipo').value;
    const stats = calcolaStatistiche(filtro);

    stats.sort((a, b) => {
        let valA = a[sortColumn] || 0;
        let valB = b[sortColumn] || 0;
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const container = canvas.parentElement;
    const w = container.clientWidth || 400;
    canvas.width = w;
    canvas.height = 300;
    canvas.style.width = w + 'px';
    canvas.style.height = '300px';

    if (charts.classifica) {
        charts.classifica.destroy();
        charts.classifica = null;
    }

    const labels = stats.map(s => s.name);
    const puntiData = stats.map(s => s.punti);
    const barColors = stats.map(s => getPlayerColor(s.id));
    const formaData = stats.map(s => {
        const forma = calcolaFormaGiocatore(s.id, filtro);
        return forma.giocate > 0 ? forma.win : null;
    });

    const ctx = canvas.getContext('2d');
    charts.classifica = new Chart(ctx, {
        data: {
            labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Punti',
                    data: puntiData,
                    backgroundColor: barColors.map(c => c + 'cc'),
                    borderColor: barColors,
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Forma (V nelle ultime 5)',
                    data: formaData,
                    borderColor: '#eab308',
                    backgroundColor: '#eab308',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#eab308',
                    tension: 0.3,
                    spanGaps: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartOptionsBase(),
            scales: {
                x: {
                    ticks: { color: "#64748b", font: { size: window.innerWidth < 600 ? 7 : 9 } },
                    grid: { color: "rgba(255,255,255,0.04)" }
                },
                y: {
                    position: 'left',
                    beginAtZero: true,
                    ticks: { color: "#64748b", font: { size: 9 } },
                    grid: { color: "rgba(255,255,255,0.04)" },
                    title: { display: true, text: 'Punti', color: '#64748b' }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    max: 5,
                    ticks: { color: "#eab308", font: { size: 9 }, stepSize: 1 },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Vittorie (ultime 5)', color: '#eab308' }
                }
            }
        }
    });
}

// ---- STATS ROW ----
function aggiornaStats() {
    document.getElementById("stat-giocatori").textContent = players.length;
    document.getElementById("stat-partite").textContent = matches.length;
    let golTotali = 0;
    matches.forEach(m => (m.scorers || []).forEach(sc => golTotali += sc.goals));
    document.getElementById("stat-gol").textContent = golTotali;

    const stats = calcolaStatistiche('all');
    if (stats.length > 0) {
        const top = stats.reduce((a, b) => a.gol > b.gol ? a : b);
        document.getElementById("stat-capocannoniere").textContent = top.gol > 0 ? top.name : "—";
    } else {
        document.getElementById("stat-capocannoniere").textContent = "—";
    }
}

// ---- MODALE GIOCATORE ----
let modalChart = null;

function apriModalGiocatore(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;
    const stats = calcolaStatistiche('all').find(s => s.id === id);
    if (!stats) return;

    const modal = document.getElementById('player-modal');
    const badgeMap = calcolaBadgeGiocatori();
    const badges = badgeMap[id] || [];
    const badgesHtml = badges.length > 0
        ? `<div class="card-badges" style="margin-top:8px;">${badges.map(b => `<span class="player-badge" title="${b.label}">${b.icon} ${b.label}</span>`).join('')}</div>`
        : '';
    document.getElementById('modal-player-name').innerHTML = `
        <span class="player-avatar" style="background:${getPlayerColor(id)};">${getInitials(p.name)}</span>
        ${escapeHtml(p.name)}
        ${badgesHtml}
    `;

    const container = document.getElementById('modal-player-stats');
    container.innerHTML = `
        <div class="stat-item"><span class="stat-label">Partite giocate</span><span class="stat-value">${stats.pg}</span></div>
        <div class="stat-item"><span class="stat-label">Vittorie</span><span class="stat-value">${stats.v}</span></div>
        <div class="stat-item"><span class="stat-label">Pareggi</span><span class="stat-value">${stats.p}</span></div>
        <div class="stat-item"><span class="stat-label">Sconfitte</span><span class="stat-value">${stats.s}</span></div>
        <div class="stat-item"><span class="stat-label">Gol segnati</span><span class="stat-value">${stats.gol}</span></div>
        <div class="stat-item"><span class="stat-label">Punti totali</span><span class="stat-value">${stats.punti}</span></div>
        <div class="stat-item"><span class="stat-label">Media gol a partita</span><span class="stat-value">${stats.pg > 0 ? (stats.gol / stats.pg).toFixed(2) : '0.00'}</span></div>
        <div class="stat-item"><span class="stat-label">Clean sheet</span><span class="stat-value">${stats.cleanSheets || 0}</span></div>
    `;

    if (modalChart) { modalChart.destroy(); modalChart = null; }
    const ctx = document.getElementById('modal-player-chart');
    if (ctx) {
        const partiteGiocate = matches.filter(m => m.teamA.includes(id) || m.teamB.includes(id))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (partiteGiocate.length > 0) {
            const labels = partiteGiocate.map(m => formatDataBreve(m.date));
            const puntiCumulativi = [];
            const puntiPartita = [];
            const coloriEsito = [];
            const esiti = [];
            let cum = 0;
            partiteGiocate.forEach(m => {
                const inA = m.teamA.includes(id);
                const inB = m.teamB.includes(id);
                const vincitoreA = m.scoreA > m.scoreB;
                const vincitoreB = m.scoreB > m.scoreA;
                let puntiMatch = 0;
                let esito = 'P';
                if (inA || inB) {
                    puntiMatch += 1;
                    if ((inA && vincitoreA) || (inB && vincitoreB)) { puntiMatch += 3; esito = 'V'; }
                    else if (m.scoreA === m.scoreB) { esito = 'P'; }
                    else { esito = 'S'; }
                }
                cum += puntiMatch;
                puntiCumulativi.push(cum);
                puntiPartita.push(puntiMatch);
                esiti.push(esito);
                coloriEsito.push(esito === 'V' ? '#22c55e' : esito === 'S' ? '#ef4444' : '#94a3b8');
            });

            const ultimeCinque = esiti.slice(-5);
            const wrap = document.getElementById('modal-player-chart').closest('div');
            let formaBar = document.getElementById('modal-player-forma');
            if (!formaBar) {
                formaBar = document.createElement('div');
                formaBar.id = 'modal-player-forma';
                formaBar.style.cssText = 'display:flex; gap:6px; margin-bottom:10px;';
                wrap.insertBefore(formaBar, document.getElementById('modal-player-chart'));
            }
            formaBar.innerHTML = ultimeCinque.map(e => {
                const bg = e === 'V' ? '#22c55e' : e === 'S' ? '#ef4444' : '#94a3b8';
                return `<span style="width:22px; height:22px; border-radius:50%; background:${bg}; color:#fff; font-size:0.65rem; font-weight:700; display:flex; align-items:center; justify-content:center;">${e}</span>`;
            }).join('');

            modalChart = new Chart(ctx, {
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Punti partita',
                            data: puntiPartita,
                            backgroundColor: coloriEsito,
                            borderRadius: 3,
                            yAxisID: 'y'
                        },
                        {
                            type: 'line',
                            label: 'Punti cumulativi',
                            data: puntiCumulativi,
                            borderColor: getPlayerColor(id),
                            backgroundColor: getPlayerColor(id) + '33',
                            fill: true,
                            tension: 0.3,
                            pointRadius: 3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', font: { size: 9 } }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#64748b', font: { size: 8 } },
                            grid: { color: 'rgba(255,255,255,0.04)' }
                        },
                        y: {
                            position: 'left',
                            ticks: { color: '#64748b', font: { size: 8 } },
                            grid: { color: 'rgba(255,255,255,0.04)' },
                            beginAtZero: true,
                            title: { display: true, text: 'Punti partita', color: '#64748b' }
                        },
                        y1: {
                            position: 'right',
                            ticks: { color: getPlayerColor(id), font: { size: 8 } },
                            grid: { drawOnChartArea: false },
                            beginAtZero: true,
                            title: { display: true, text: 'Cumulativi', color: getPlayerColor(id) }
                        }
                    }
                }
            });
        }
    }

    modal.classList.add('active');
}

document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('player-modal').classList.remove('active');
    if (modalChart) { modalChart.destroy(); modalChart = null; }
});
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('player-modal')) {
        document.getElementById('player-modal').classList.remove('active');
        if (modalChart) { modalChart.destroy(); modalChart = null; }
    }
});

// ---- LISTA PARTITE ----
function renderListaPartite() {
    const wrap = document.getElementById("lista-partite");
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!matches || matches.length === 0) {
        wrap.innerHTML = `<p class="empty-msg">Nessuna partita registrata.</p>`;
        return;
    }

    const ordinate = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
    ordinate.forEach(m => {
        const card = document.createElement("div");
        card.className = "partita-card";

        let ovrA = 0, ovrB = 0;
        if (m.teamA && m.teamA.length) {
            m.teamA.forEach(pid => {
                const p = players.find(pl => pl.id === pid);
                ovrA += p ? p.overall : 0;
            });
        }
        if (m.teamB && m.teamB.length) {
            m.teamB.forEach(pid => {
                const p = players.find(pl => pl.id === pid);
                ovrB += p ? p.overall : 0;
            });
        }
        const maxOvr = Math.max(ovrA, ovrB, 1);
        const percentA = (ovrA / maxOvr) * 100;
        const percentB = (ovrB / maxOvr) * 100;

        const difReti = m.scoreA - m.scoreB;
        const mediaGolA = (m.teamA && m.teamA.length > 0) ? (m.scoreA / m.teamA.length).toFixed(1) : '0';
        const mediaGolB = (m.teamB && m.teamB.length > 0) ? (m.scoreB / m.teamB.length).toFixed(1) : '0';
        let cleanSheet = 'Nessuno';
        if (m.scoreA > 0 && m.scoreB === 0) cleanSheet = 'A';
        else if (m.scoreB > 0 && m.scoreA === 0) cleanSheet = 'B';

        const marcatoriA = (m.scorers || []).filter(sc => sc.squad === 'A');
        const marcatoriB = (m.scorers || []).filter(sc => sc.squad === 'B');
        const txtA = marcatoriA.length ? marcatoriA.map(sc => `${nomeGiocatore(sc.playerId)} (${sc.goals})`).join(', ') : 'Nessuno';
        const txtB = marcatoriB.length ? marcatoriB.map(sc => `${nomeGiocatore(sc.playerId)} (${sc.goals})`).join(', ') : 'Nessuno';

        const nomiA = (m.teamA || []).map(nomeGiocatore).join(', ');
        const nomiB = (m.teamB || []).map(nomeGiocatore).join(', ');

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
          <div class="match-stats-extra">
            <span class="stat-badge">📊 Diff. reti: ${difReti > 0 ? '+' : ''}${difReti}</span>
            <span class="stat-badge green">A: media ${mediaGolA} gol/gioc.</span>
            <span class="stat-badge blue">B: media ${mediaGolB} gol/gioc.</span>
            <span class="stat-badge gold">🧤 Clean sheet: ${cleanSheet}</span>
          </div>
          <div class="squadre-riepilogo">
            <div class="sq-a">
              <span class="sq-label">🟢 Squadra A</span>
              <div class="sq-players">${nomiA}</div>
              <div class="sq-ovr"><span class="ovr-label">OVR</span> ${ovrA}</div>
            </div>
            <div class="sq-b">
              <span class="sq-label">🔵 Squadra B</span>
              <div class="sq-players">${nomiB}</div>
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
            <button class="btn btn-secondary btn-sm" onclick="window.modificaPartita('${m.id}')">✏️ Modifica</button>
            <button class="btn btn-danger btn-sm" onclick="window.eliminaPartita('${m.id}')">Elimina</button>
          </div>
        `;
        wrap.appendChild(card);
    });
}

window.modificaPartita = function (id) {
    const m = matches.find(m => m.id === id);
    if (!m) {
        showToast('Partita non trovata.', 'error');
        return;
    }

    editMatchId = id;
    document.getElementById('edit-match-id').value = id;
    document.getElementById('btn-salva-partita').textContent = '✏️ Aggiorna Partita';
    document.getElementById('btn-annulla-modifica').style.display = 'inline-block';

    document.getElementById('p-data').value = m.date;
    document.getElementById('p-tipo').value = m.type;
    document.getElementById('p-score-a').value = m.scoreA;
    document.getElementById('p-score-b').value = m.scoreB;

    selezioneA = new Set(m.teamA || []);
    selezioneB = new Set(m.teamB || []);
    aggiornaChipVisuali();
    aggiornaLimite();

    document.getElementById('marcatori-wrap-a').innerHTML = '';
    document.getElementById('marcatori-wrap-b').innerHTML = '';
    (m.scorers || []).forEach(sc => {
        const squadra = sc.squad === 'A' ? 'a' : 'b';
        const wrapId = squadra === 'a' ? 'marcatori-wrap-a' : 'marcatori-wrap-b';
        const wrap = document.getElementById(wrapId);
        const row = document.createElement("div");
        row.className = "marcatore-row";
        const sel = document.createElement("select");
        sel.className = "sel-giocatore";
        popolaSelectGiocatoriPerSquadra(sel, squadra);
        sel.value = sc.playerId;
        const inputGol = document.createElement("input");
        inputGol.type = "number";
        inputGol.className = "input-gol";
        inputGol.min = "1";
        inputGol.value = sc.goals;
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
    });
    if ((m.scorers || []).length === 0) {
        aggiungiRigaMarcatore('a');
        aggiungiRigaMarcatore('b');
    }

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="nuova-partita"]').classList.add('active');
    document.getElementById('nuova-partita').classList.add('active');

    showToast('Modifica partita in corso...', 'info');
};

window.eliminaPartita = async function (id) {
    if (!confirm("Eliminare questa partita?")) return;
    matches = matches.filter(m => m.id !== id);
    await saveMatches();
    renderListaPartite();
    aggiornaStats();
    showToast('Partita eliminata', 'info');
};

// ---- ORDINAMENTO ----
document.querySelectorAll('#tabella-classifica thead th[data-sort]').forEach(th => {
    th.addEventListener('click', function () {
        const col = this.dataset.sort;
        if (sortColumn === col) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = col;
            sortDirection = 'desc';
        }
        document.querySelectorAll('#tabella-classifica thead th[data-sort]').forEach(h => {
            h.classList.remove('sorted-asc', 'sorted-desc');
        });
        this.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
        renderClassifica();
    });
});

// ---- GRAFICI ----
function distruggiGrafici() {
    Object.values(charts).forEach(c => c && c.destroy());
    charts = {};
}

function renderTuttiGrafici() {
    distruggiGrafici();

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

    setTimeout(() => {
        try {
            renderGraficoAndamento();
            renderGraficoMarcatori();
            renderGraficoPunti();
            renderGraficoTipi();
        } catch (e) {
            console.error('Errore creazione grafici:', e);
        }
        setTimeout(() => {
            Object.values(charts).forEach(c => { try { c && c.resize && c.resize(); } catch (e) { } });
        }, 150);
    }, 400);
}

function coloreDaIndice(i) {
    const palette = ["#d4a017", "#93493c", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];
    return palette[i % palette.length];
}

function chartOptionsBase() {
    const isMobile = window.innerWidth < 600;
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                labels: { color: "#94a3b8", font: { size: isMobile ? 8 : 10 }, boxWidth: 12, padding: 12 }
            }
        },
        scales: {
            x: {
                ticks: { color: "#64748b", font: { size: isMobile ? 7 : 9 } },
                grid: { color: "rgba(255,255,255,0.04)" }
            },
            y: {
                ticks: { color: "#64748b", font: { size: isMobile ? 7 : 9 } },
                grid: { color: "rgba(255,255,255,0.04)" },
                beginAtZero: true
            }
        }
    };
}

function renderGraficoAndamento() {
    const ctx = document.getElementById("chart-andamento");
    if (!ctx) return;
    const statsAttuali = calcolaStatistiche('all');
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
            if ((m.teamA || []).includes(pid)) { cumulato[pid] += 1; if (vincitoreA) cumulato[pid] += 3; }
            else if ((m.teamB || []).includes(pid)) { cumulato[pid] += 1; if (vincitoreB) cumulato[pid] += 3; }
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

function renderGraficoMarcatori() {
    const ctx = document.getElementById("chart-marcatori");
    if (!ctx) return;
    const stats = calcolaStatistiche('all').filter(s => s.gol > 0).sort((a, b) => b.gol - a.gol).slice(0, 10);
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
    const stats = calcolaStatistiche('all').slice(0, 15);
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
    reader.onload = async (e) => {
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
            await savePlayers();
            renderGiocatoriGrid();
            aggiornaStats();
            status.textContent = `✅ Importati ${aggiunti}, aggiornati ${aggiornati}.`;
            showToast(`Importati ${aggiunti} giocatori`, 'success');
        } catch (err) {
            status.textContent = "❌ Errore lettura.";
            showToast('Errore import CSV', 'error');
            console.error(err);
        }
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
    showToast('Backup esportato', 'success');
});

document.getElementById("btn-import-json").addEventListener("click", () => {
    const file = document.getElementById("input-json").files[0];
    if (!file) { showToast('Seleziona un file JSON.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const dati = JSON.parse(e.target.result);
            if (!confirm("Sovrascrivere tutti i dati?")) return;
            players = dati.players || [];
            matches = dati.matches || [];
            await savePlayers();
            await saveMatches();
            showToast('✅ Backup importato.', 'success');
            renderGiocatoriGrid();
            renderClassifica();
            aggiornaStats();
        } catch (err) {
            showToast('❌ File non valido.', 'error');
        }
    };
    reader.readAsText(file, "UTF-8");
});

document.getElementById("btn-reset").addEventListener("click", async () => {
    if (!confirm("Cancellare TUTTI i dati?") || !confirm("Confermi davvero?")) return;
    players = [];
    matches = [];
    await savePlayers();
    await saveMatches();
    renderGiocatoriGrid();
    renderClassifica();
    aggiornaStats();
    showToast('Dati cancellati.', 'info');
});

// ---- MODALE GRAFICI ----
let chartModalInitialized = false;
let modalChartInstance = null;

function setupChartModal() {
    if (chartModalInitialized) return;
    chartModalInitialized = true;

    const modal = document.getElementById('chart-modal');
    const closeBtn = document.querySelector('.chart-modal-close');
    const modalCanvas = document.getElementById('chart-modal-canvas');

    if (!modal || !closeBtn || !modalCanvas) return;

    document.querySelectorAll('.chart-box').forEach(box => {
        box.addEventListener('click', function (e) {
            const canvas = this.querySelector('canvas');
            if (!canvas) return;

            let chartInstance = null;
            for (const key in charts) {
                if (charts[key] && charts[key].canvas === canvas) {
                    chartInstance = charts[key];
                    break;
                }
            }
            if (!chartInstance) {
                const chartKey = this.dataset.chart;
                if (chartKey && charts[chartKey]) {
                    chartInstance = charts[chartKey];
                }
            }
            if (!chartInstance) {
                showToast('Grafico non disponibile', 'error');
                return;
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const ctx = modalCanvas.getContext('2d');
            if (modalChartInstance) {
                modalChartInstance.destroy();
                modalChartInstance = null;
            }

            const data = JSON.parse(JSON.stringify(chartInstance.data));
            const options = JSON.parse(JSON.stringify(chartInstance.options));

            if (options.plugins && options.plugins.legend) {
                options.plugins.legend.labels = options.plugins.legend.labels || {};
                options.plugins.legend.labels.font = options.plugins.legend.labels.font || {};
                options.plugins.legend.labels.font.size = 14;
            }
            if (options.scales) {
                if (options.scales.x) {
                    options.scales.x.ticks = options.scales.x.ticks || {};
                    options.scales.x.ticks.font = options.scales.x.ticks.font || {};
                    options.scales.x.ticks.font.size = 12;
                }
                if (options.scales.y) {
                    options.scales.y.ticks = options.scales.y.ticks || {};
                    options.scales.y.ticks.font = options.scales.y.ticks.font || {};
                    options.scales.y.ticks.font.size = 12;
                }
            }

            const container = modal.querySelector('.chart-modal-body');
            const containerWidth = container.clientWidth || 600;
            const containerHeight = container.clientHeight || 400;
            modalCanvas.width = containerWidth;
            modalCanvas.height = containerHeight;
            modalCanvas.style.width = containerWidth + 'px';
            modalCanvas.style.height = containerHeight + 'px';

            modalChartInstance = new Chart(ctx, {
                type: chartInstance.config.type,
                data: data,
                options: {
                    ...options,
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });

            setTimeout(() => {
                if (modalChartInstance) {
                    modalChartInstance.resize();
                }
            }, 100);
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalChartInstance) {
            modalChartInstance.destroy();
            modalChartInstance = null;
        }
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    const observer = new MutationObserver(() => {
        if (modal.classList.contains('active') && modalChartInstance) {
            setTimeout(() => {
                const container = modal.querySelector('.chart-modal-body');
                if (container) {
                    const w = container.clientWidth || 600;
                    const h = container.clientHeight || 400;
                    const canvas = document.getElementById('chart-modal-canvas');
                    if (canvas) {
                        canvas.width = w;
                        canvas.height = h;
                        canvas.style.width = w + 'px';
                        canvas.style.height = h + 'px';
                    }
                    modalChartInstance.resize();
                }
            }, 50);
        }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
}
// ---- ANTEPRIMA FOTO DA URL ----
document.getElementById('g-photo-url').addEventListener('input', function () {
    const url = this.value.trim();
    const previewDiv = document.getElementById('photo-preview');
    const previewImg = document.getElementById('photo-preview-img');
    if (url) {
        previewImg.src = url;
        previewDiv.style.display = 'flex';
        previewImg.onerror = function () {
            // Se l'immagine non si carica, nasconde l'anteprima
            previewDiv.style.display = 'none';
        };
    } else {
        previewDiv.style.display = 'none';
        previewImg.src = '';
    }
});

document.getElementById('btn-remove-photo').addEventListener('click', function () {
    document.getElementById('g-photo-url').value = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-preview-img').src = '';
});
// ---- INIZIALIZZAZIONE APP ----
async function initApp() {
    try {
        players = await loadPlayers();
        matches = await loadMatches();

        if (players.length === 0 && matches.length === 0) {
            await seedDemoData();
            players = await loadPlayers();
            matches = await loadMatches();
        }

        document.getElementById("p-data").valueAsDate = new Date();

        renderClassifica();
        renderGiocatoriGrid();
        aggiornaStats();
        renderListaPartite();
        if (players.length > 0) {
            aggiungiRigaMarcatore('a');
            aggiungiRigaMarcatore('b');
        }

        setupChartModal();
        if (document.getElementById('statistiche').classList.contains('active')) {
            renderTuttiGrafici();
        }

        console.log("⚽ Campionato tra Amici — pronto!");
    } catch (err) {
        console.error(err);
        showToast('Errore durante il caricamento dei dati. Controlla la console.', 'error');
    } finally {
        // Nascondi il loader
        const loader = document.getElementById('app-loader');
        if (loader) loader.style.display = 'none';
    }
}

// Avvia l'app
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const bg = new FootballBackground(canvas);
        window.__bgFootball = bg;
    }
    initApp();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch((err) => {
                console.error('Registrazione Service Worker fallita:', err);
            });
        });
    }
});