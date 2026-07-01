# Campionato tra Amici ⚽

App statica per gestire le partite di calcetto/calciotto con gli amici.

## File
- `index.html` — pagina principale
- `style.css` — stile
- `app.js` — logica (localStorage, classifica, grafici)
- `players_esempio.csv` — esempio formato CSV giocatori

## Pubblicazione su GitHub Pages
1. Crea una repo su GitHub e carica questi file nella root (o in `/docs`).
2. Vai su **Settings > Pages**.
3. In "Source" scegli il branch (es. `main`) e la cartella (`/root` o `/docs`).
4. Salva: l'app sarà disponibile su `https://<utente>.github.io/<repo>/`.

## Dati
Attualmente tutto è salvato nel `localStorage` del browser (nessun server).
Nella scheda **Dati** puoi:
- Importare i giocatori da CSV (`Nome giocatore,Overall`)
- Esportare/importare un backup completo in JSON

## Prossimi sviluppi
Per recuperare i dati dei giocatori da un server, basterà sostituire in `app.js`
la funzione `loadPlayers()` con una `fetch()` verso l'endpoint/CSV remoto.
