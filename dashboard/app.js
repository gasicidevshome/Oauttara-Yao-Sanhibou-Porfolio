// Tableau de bord privé de Gasici Mito Dev.
// - Données dans ce navigateur uniquement (localStorage), chiffrables par mot de passe (crypto.js).
// - Aucune requête réseau (CSP connect-src 'none'), aucun style inline (CSP), tout texte saisi passe par esc().
(function () {
  "use strict";
  const KEY = "gpsd-dashboard-v1";
  const EUR = 655.957;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = n => Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const F = n => num(n) + " F";
  const sF = n => (n < 0 ? "−" : "") + F(Math.abs(n));
  const short = n => { const a = Math.abs(Number(n) || 0), s = n < 0 ? "−" : ""; return s + (a >= 1e6 ? (a / 1e6).toFixed(1).replace(".", ",") + " M" : a >= 1e4 ? Math.round(a / 1e3) + " k" : num(a)); };
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const ym = d => d.slice(0, 7);
  const dmy = d => (d ? d.split("-").reverse().slice(0, 2).join("/") : "");
  const uid = () => (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));
  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const MOIS_L = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const mLbl = m => `${MOIS[+m.slice(5) - 1]} ${m.slice(2, 4)}`;
  const addMonths = (m, k) => { const d = new Date(+m.slice(0, 4), +m.slice(5) - 1 + k, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
  const lastDay = m => iso(new Date(+m.slice(0, 4), +m.slice(5), 0));
  const ICON = {
    del: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>',
    csv: '<svg viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 9v8H9"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>',
  };

  // ════════ SCHÉMA DES LISTES ════════
  const DEV = ["F", "EUR", "USD"];
  const L = {
    revenus: {
      titre: "Revenus", one: "revenu", sort: ["date", -1],
      f: [
        { k: "date", l: "Date", t: "date", req: 1, col: 1 },
        { k: "source", l: "Source", t: "select", o: ["Chariow", "ComeUp", "Fiverr", "Upwork", "Freelancer", "Client direct", "Formation", "Autre"], col: 1 },
        { k: "client", l: "Client", t: "text", col: 1 },
        { k: "desc", l: "Description", t: "text", col: 1 },
        { k: "montant", l: "Montant", t: "number", req: 1, money: 1, col: 1 },
        { k: "devise", l: "Devise", t: "select", o: DEV },
        { k: "statut", l: "Statut", t: "select", o: ["Encaissé", "En attente", "Annulé"], st: 1, col: 1 },
      ],
      ton: { "Encaissé": "good", "En attente": "warn", "Annulé": "neutral" },
      sum: x => (x.statut === "Encaissé" ? toF(x) : 0), sumLbl: "Encaissé (lignes affichées)",
    },
    depenses: {
      titre: "Dépenses", one: "dépense", sort: ["date", -1],
      f: [
        { k: "date", l: "Date", t: "date", req: 1, col: 1 },
        { k: "categorie", l: "Catégorie", t: "select", o: ["Publicité", "Abonnement", "Matériel", "Internet", "Formation", "Transport", "Autre"], col: 1 },
        { k: "desc", l: "Description", t: "text", col: 1 },
        { k: "montant", l: "Montant", t: "number", req: 1, money: 1, col: 1 },
        { k: "devise", l: "Devise", t: "select", o: DEV },
        { k: "recurrent", l: "Récurrence", t: "select", o: ["Non", "Mensuel", "Annuel"], col: 1 },
        { k: "statut", l: "Statut", t: "select", o: ["Payé", "À payer"], st: 1, col: 1 },
      ],
      ton: { "Payé": "neutral", "À payer": "bad" },
      sum: x => toF(x), sumLbl: "Total (lignes affichées)",
    },
    projets: {
      titre: "Projets clients", one: "projet", sort: ["livraison", 1],
      f: [
        { k: "nom", l: "Projet", t: "text", req: 1, col: 1 },
        { k: "client", l: "Client", t: "text", col: 1 },
        { k: "type", l: "Type", t: "select", o: ["Site vitrine", "Outil Excel", "Formation", "Application", "Maintenance", "Autre"], col: 1 },
        { k: "montant", l: "Montant total (F)", t: "number", money: 1, col: 1 },
        { k: "encaisse", l: "Déjà encaissé (F)", t: "number", money: 1, col: 1 },
        { k: "statut", l: "Statut", t: "select", o: ["Devis", "En cours", "Livré", "Payé", "Annulé"], st: 1, col: 1 },
        { k: "debut", l: "Début", t: "date" },
        { k: "livraison", l: "Livraison prévue", t: "date", col: 1 },
        { k: "avancement", l: "Avancement (%)", t: "number", max: 100, col: 1 },
        { k: "notes", l: "Notes", t: "text" },
      ],
      ton: { "Devis": "neutral", "En cours": "warn", "Livré": "info", "Payé": "good", "Annulé": "bad" },
      sum: x => (x.statut === "Annulé" ? 0 : Math.max(0, (+x.montant || 0) - (+x.encaisse || 0))), sumLbl: "Reste à encaisser (lignes affichées)",
    },
    pipeline: {
      titre: "Opportunités", one: "opportunité", sort: ["echeance", 1],
      f: [
        { k: "nom", l: "Opportunité", t: "text", req: 1, col: 1 },
        { k: "type", l: "Type", t: "select", o: ["Client site", "Client Excel", "Formation", "Freelance", "Appel à projets", "Partenariat", "Relance produit"], col: 1 },
        { k: "contact", l: "Contact", t: "text", col: 1 },
        { k: "etape", l: "Étape", t: "select", o: ["À contacter", "Contacté", "En discussion", "Devis envoyé", "Gagné", "Perdu"], st: 1, col: 1 },
        { k: "valeur", l: "Valeur estimée (F)", t: "number", money: 1, col: 1 },
        { k: "echeance", l: "Échéance", t: "date", col: 1 },
        { k: "prochaine", l: "Prochaine action", t: "text", col: 1 },
        { k: "notes", l: "Notes", t: "text" },
      ],
      ton: { "À contacter": "neutral", "Contacté": "warn", "En discussion": "warn", "Devis envoyé": "info", "Gagné": "good", "Perdu": "bad" },
      sum: x => (ACTIVE(x) ? +x.valeur || 0 : 0), sumLbl: "Valeur en cours (lignes affichées)",
    },
    taches: {
      titre: "Tâches", one: "tâche", sort: ["echeance", 1],
      f: [
        { k: "texte", l: "Tâche", t: "text", req: 1, col: 1 },
        { k: "echeance", l: "Échéance", t: "date", col: 1 },
        { k: "priorite", l: "Priorité", t: "select", o: ["Haute", "Normale", "Basse"], col: 1 },
        { k: "categorie", l: "Catégorie", t: "select", o: ["Vente", "Freelance", "Formation", "Admin", "Perso"], col: 1 },
      ],
      filters: ["À faire", "En retard", "Faites", "Tous"],
    },
    plateformes: {
      titre: "Plateformes", one: "plateforme", sort: null,
      f: [
        { k: "nom", l: "Plateforme", t: "text", req: 1, col: 1 },
        { k: "statut", l: "Statut", t: "select", o: ["À créer", "En validation", "Actif", "En pause"], st: 1, col: 1 },
        { k: "lien", l: "Lien du profil (https://…)", t: "url", col: 1 },
        { k: "notes", l: "Notes", t: "text", col: 1 },
      ],
      ton: { "À créer": "neutral", "En validation": "warn", "Actif": "good", "En pause": "bad" },
    },
  };
  const LISTS = Object.keys(L);
  const ACTIVE = x => !["Gagné", "Perdu"].includes(x.etape);
  const STAGES = ["À contacter", "Contacté", "En discussion", "Devis envoyé", "Gagné"];

  // ════════ DONNÉES ════════
  const empty = () => ({ revenus: [], depenses: [], projets: [], pipeline: [], taches: [], plateformes: [], journal: [], reglages: { objectif: 100000, objectifAn: 0, tauxUSD: 0, lastExport: "" } });
  function clean(d) {
    const out = empty();
    if (!d || typeof d !== "object") return out;
    for (const k of [...LISTS, "journal"]) if (Array.isArray(d[k])) out[k] = d[k].filter(x => x && typeof x === "object").slice(0, 5000).map(x => {
      const y = {};
      for (const [a, b] of Object.entries(x)) if (/^[a-zA-Z]{1,20}$/.test(a) && ["string", "number", "boolean"].includes(typeof b)) y[a] = typeof b === "string" ? b.slice(0, 500) : b;
      if (k !== "journal") y.id = String(y.id || uid()).slice(0, 40);
      return y;
    });
    out.journal = out.journal.slice(-80);
    const r = d.reglages || {};
    for (const k of ["objectif", "objectifAn", "tauxUSD"]) if (Number(r[k]) >= 0) out.reglages[k] = Number(r[k]);
    if (typeof r.lastExport === "string") out.reglages.lastExport = r.lastExport.slice(0, 10);
    if (typeof r.ghToken === "string" && /^[\w-]{20,255}$/.test(r.ghToken)) out.reglages.ghToken = r.ghToken;
    return out;
  }
  const toF = x => { const m = +x.montant || 0; return x.devise === "EUR" ? m * EUR : x.devise === "USD" ? m * (+DB.reglages.tauxUSD || 0) : m; };
  const usdMissing = () => !(+DB.reglages.tauxUSD) && [...DB.revenus, ...DB.depenses].some(x => x.devise === "USD");

  let DB = empty(), K = null, writing = Promise.resolve();
  function persist() {
    const snap = JSON.parse(JSON.stringify(DB)), key = K;
    writing = writing.then(async () => {
      try { localStorage.setItem(KEY, JSON.stringify(key ? await GMCrypto.encrypt(key, snap) : snap)); }
      catch (e) { toast("Enregistrement impossible ici : télécharge une sauvegarde."); }
    });
    return writing;
  }
  function log(txt) { DB.journal.push({ t: new Date().toISOString(), txt: String(txt).slice(0, 200) }); DB.journal = DB.journal.slice(-80); }
  function commit(txt) { if (txt) log(txt); persist(); render(); }

  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2800); }
  function applyDims(root = document) {
    $$("[data-h]", root).forEach(el => (el.style.height = el.dataset.h + "%"));
    $$("[data-w]", root).forEach(el => (el.style.width = el.dataset.w + "%"));
  }

  // ════════ PÉRIODES ════════
  const UI = { period: "mois", flow: "rev", split: "src", cal: ym(today()), calDay: today(), fin: "revenus", lists: {} };
  try { Object.assign(UI, JSON.parse(sessionStorage.getItem(KEY + "-ui")) || {}); } catch (e) {}
  const saveUI = () => { try { sessionStorage.setItem(KEY + "-ui", JSON.stringify({ period: UI.period, flow: UI.flow, split: UI.split, fin: UI.fin })); } catch (e) {} };
  function range(p) {
    const m = ym(today()), y = m.slice(0, 4);
    if (p === "dernier") { const a = addMonths(m, -1); return { s: a + "-01", e: lastDay(a), ps: addMonths(a, -1) + "-01", pe: lastDay(addMonths(a, -1)), lbl: `${MOIS_L[+a.slice(5) - 1]} ${a.slice(0, 4)}`, cmp: MOIS_L[+addMonths(a, -1).slice(5) - 1], end: a }; }
    if (p === "3mois") { const a = addMonths(m, -2); return { s: a + "-01", e: lastDay(m), ps: addMonths(a, -3) + "-01", pe: lastDay(addMonths(a, -1)), lbl: `${mLbl(a)} – ${mLbl(m)}`, cmp: "3 mois précédents", end: m }; }
    if (p === "annee") return { s: y + "-01-01", e: y + "-12-31", ps: (y - 1) + "-01-01", pe: (y - 1) + "-12-31", lbl: `année ${y}`, cmp: String(y - 1), end: y + "-12", year: y };
    if (p === "tout") return { s: "0000", e: "9999", lbl: "toutes les données", end: m };
    return { s: m + "-01", e: lastDay(m), ps: addMonths(m, -1) + "-01", pe: lastDay(addMonths(m, -1)), lbl: `${MOIS_L[+m.slice(5) - 1]} ${y}`, cmp: MOIS_L[+addMonths(m, -1).slice(5) - 1], end: m };
  }
  const inR = (d, s, e) => !!d && d >= s && d <= e;
  const sumRev = (s, e) => DB.revenus.filter(x => x.statut === "Encaissé" && inR(x.date, s, e)).reduce((a, x) => a + toF(x), 0);
  const sumDep = (s, e) => DB.depenses.filter(x => inR(x.date, s, e)).reduce((a, x) => a + toF(x), 0);

  // ════════ VUE D'ENSEMBLE ════════
  function delta(cur, prev, goodUp = true) {
    if (prev === undefined) return "";
    if (!prev && !cur) return `<span class="delta flat">= stable</span>`;
    if (!prev) return `<span class="delta ${goodUp ? "good" : "bad"}">${ICON.up}nouveau</span>`;
    const p = ((cur - prev) / Math.abs(prev)) * 100, up = p >= 0, good = up === goodUp;
    if (Math.abs(p) < 0.5) return `<span class="delta flat">= stable</span>`;
    return `<span class="delta ${good ? "good" : "bad"}">${up ? ICON.up : ICON.down}${up ? "+" : "−"}${Math.abs(p).toFixed(0)} %</span>`;
  }
  function renderKPIs(R) {
    const enc = sumRev(R.s, R.e), dep = sumDep(R.s, R.e), net = enc - dep;
    const hasPrev = !!R.ps, pEnc = hasPrev ? sumRev(R.ps, R.pe) : undefined, pDep = hasPrev ? sumDep(R.ps, R.pe) : undefined;
    const ventes = DB.revenus.filter(x => x.statut === "Encaissé" && inR(x.date, R.s, R.e));
    const pVentes = hasPrev ? DB.revenus.filter(x => x.statut === "Encaissé" && inR(x.date, R.ps, R.pe)).length : undefined;
    const reste = DB.projets.filter(x => x.statut !== "Annulé").reduce((a, x) => a + Math.max(0, (+x.montant || 0) - (+x.encaisse || 0)), 0)
      + DB.revenus.filter(x => x.statut === "En attente").reduce((a, x) => a + toF(x), 0);
    const closed = DB.pipeline.filter(x => !ACTIVE(x)), won = closed.filter(x => x.etape === "Gagné").length;
    const conv = closed.length ? Math.round((won / closed.length) * 100) : null;
    const tiles = [
      { l: "Encaissé", v: F(enc), d: delta(enc, pEnc), s: hasPrev ? `vs ${R.cmp} : ${F(pEnc)}` : `${ventes.length} encaissement(s)` },
      { l: "Dépenses", v: F(dep), d: delta(dep, pDep, false), s: hasPrev ? `vs ${R.cmp} : ${F(pDep)}` : "" },
      { l: "Résultat net", v: sF(net), d: hasPrev ? delta(net, pEnc - pDep) : "", s: enc ? `marge ${Math.round((net / enc) * 100)} %` : "aucun encaissement", neg: net < 0 },
      { l: "Ventes", v: ventes.length, d: delta(ventes.length, pVentes), s: ventes.length ? `panier moyen ${F(enc / ventes.length)}` : "—" },
      { l: "Reste à encaisser", v: F(reste), d: "", s: "projets + paiements en attente" },
      { l: "Taux de conversion", v: conv === null ? "—" : conv + " %", d: "", s: closed.length ? `${won} gagnée(s) sur ${closed.length} terminée(s)` : "aucune opportunité terminée" },
    ];
    $("#kpis").innerHTML = tiles.map(t => `<div class="glass kpi${t.neg ? " neg" : ""}"><div class="kpi-top"><span>${esc(t.l)}</span>${t.d}</div><b>${esc(t.v)}</b><small>${esc(t.s)}</small></div>`).join("");
  }

  function flowMonths(R) {
    const end = R.year ? R.year + "-12" : R.end, n = R.year ? 12 : UI.period === "tout" ? 12 : 6;
    return Array.from({ length: n }, (_, i) => addMonths(end, i - n + 1));
  }
  function renderFlow(R) {
    const ms = flowMonths(R);
    const serie = UI.flow, name = { rev: "Revenus encaissés", dep: "Dépenses", net: "Résultat net" }[serie];
    $("#flow-title").textContent = name;
    $$("#flow-seg button").forEach(b => b.classList.toggle("on", b.dataset.s === serie));
    const vals = ms.map(m => { const s = m + "-01", e = lastDay(m), r = sumRev(s, e), d = sumDep(s, e); return serie === "rev" ? r : serie === "dep" ? d : r - d; });
    const max = Math.max(...vals.map(Math.abs), 1);
    const box = $("#flow-steps");
    box.className = "steps" + (serie === "dep" ? " pink" : "") + (ms.length > 6 ? " dense" : "");
    box.innerHTML = ms.map((m, i) => {
      const v = vals[i], inP = UI.period !== "tout" && inR(m + "-15", R.s, R.e);
      return `<div class="step${inP ? " cur" : ""}${v < 0 ? " neg" : ""}" tabindex="0" data-tip="${esc(mLbl(m))} · ${esc(name)}" data-tipv="${esc(sF(v))}">
        <span class="k">${esc(mLbl(m))}</span><span class="v">${esc(short(v))}</span><i class="col" data-h="${Math.max((Math.abs(v) / max) * 70, v ? 4 : 1).toFixed(1)}"></i></div>`;
    }).join("");
    $("#flow-table").innerHTML = `<tr><th>Mois</th><th class="num">${esc(name)}</th></tr>` + ms.map((m, i) => `<tr><td>${esc(mLbl(m))}</td><td class="num">${esc(sF(vals[i]))}</td></tr>`).join("");
  }

  function renderGoal() {
    const m = ym(today()), obj = +DB.reglages.objectif || 0, enc = sumRev(m + "-01", lastDay(m));
    const left = Math.max(0, +lastDay(m).slice(8) - new Date().getDate() + 1);
    $("#goal-days").textContent = `${left} jour${left > 1 ? "s" : ""} restant${left > 1 ? "s" : ""}`;
    const pct = obj ? Math.round((enc / obj) * 100) : 0;
    $("#goal-pct").textContent = obj ? pct + " %" : "—";
    $("#goal-sub").textContent = obj ? (enc >= obj ? `Objectif atteint : ${F(enc)} encaissés` : `${F(enc)} sur ${F(obj)} · il manque ${F(obj - enc)}, soit ${F((obj - enc) / Math.max(left, 1))} par jour`) : "Fixe un objectif dans Réglages";
    $("#goal-bar").dataset.w = Math.min(pct, 100);
    const y = m.slice(0, 4), objY = +DB.reglages.objectifAn || 0, encY = sumRev(y + "-01-01", y + "-12-31");
    $("#goal-year").textContent = objY ? `${F(encY)} / ${F(objY)}` : `${F(encY)} encaissés en ${y}`;
    $("#goal-year-bar").dataset.w = objY ? Math.min((encY / objY) * 100, 100).toFixed(1) : 0;
  }

  function renderFunnel() {
    const idx = x => STAGES.indexOf(x.etape);
    const reached = STAGES.map((_, k) => DB.pipeline.filter(x => idx(x) >= k).length);
    const lost = DB.pipeline.filter(x => x.etape === "Perdu").length, max = Math.max(reached[0], 1);
    $("#funnel").innerHTML = STAGES.map((s, k) => {
      const conv = k && reached[k - 1] ? Math.round((reached[k] / reached[k - 1]) * 100) : null;
      return `<div class="fstep${k === STAGES.length - 1 ? " win" : ""}" tabindex="0" data-tip="${esc(s)}" data-tipv="${reached[k]} opportunité(s)${conv !== null ? ` · ${conv} % de l'étape précédente` : ""}">
        <span class="k">${esc(s)}</span><span class="v">${reached[k]}</span>
        ${conv !== null ? `<span class="conv">${conv} %</span>` : ""}
        <i class="col" data-h="${Math.max((reached[k] / max) * 74, reached[k] ? 6 : 1).toFixed(1)}"></i></div>`;
    }).join("") + `<p class="funnel-foot hint">${DB.pipeline.length} opportunité(s) au total · ${lost} perdue(s), non comptées dans l'entonnoir</p>`;
  }

  function insights(R) {
    const out = [], t = today(), m = ym(t);
    const enc = sumRev(R.s, R.e), dep = sumDep(R.s, R.e);
    if (dep > enc) out.push(["bad", `Sur ${R.lbl}, tes dépenses dépassent tes encaissements de ${F(dep - enc)}.`]);
    const aPayer = DB.depenses.filter(x => x.statut === "À payer");
    if (aPayer.length) out.push(["bad", `${F(aPayer.reduce((a, x) => a + toF(x), 0))} de dépenses restent à payer (${aPayer.length}).`]);
    const late = [...DB.pipeline.filter(x => ACTIVE(x) && x.echeance && x.echeance < t), ...DB.taches.filter(x => !x.fait && x.echeance && x.echeance < t)];
    if (late.length) out.push(["warn", `${late.length} échéance(s) dépassée(s) entre tes tâches et tes opportunités.`]);
    const noNext = DB.pipeline.filter(x => ACTIVE(x) && !x.prochaine);
    if (noNext.length) out.push(["warn", `${noNext.length} opportunité(s) en cours sans prochaine action définie.`]);
    const livres = DB.projets.filter(x => x.statut === "Livré" && (+x.montant || 0) > (+x.encaisse || 0));
    if (livres.length) out.push(["warn", `${livres.length} projet(s) livré(s) pas encore soldé(s) : ${F(livres.reduce((a, x) => a + (+x.montant || 0) - (+x.encaisse || 0), 0))} à réclamer.`]);
    const projLate = DB.projets.filter(x => x.statut === "En cours" && x.livraison && x.livraison < t);
    if (projLate.length) out.push(["bad", `${projLate.length} projet(s) en retard sur la date de livraison prévue.`]);
    const encAll = DB.revenus.filter(x => x.statut === "Encaissé"), tot = encAll.reduce((a, x) => a + toF(x), 0);
    const bySrc = {}; encAll.forEach(x => (bySrc[x.source || "Autre"] = (bySrc[x.source || "Autre"] || 0) + toF(x)));
    const top = Object.entries(bySrc).sort((a, b) => b[1] - a[1])[0];
    if (top && tot && top[1] / tot >= 0.8) out.push(["info", `${top[0]} représente ${Math.round((top[1] / tot) * 100)} % de tes revenus : diversifie tes sources.`]);
    const obj = +DB.reglages.objectif || 0, encM = sumRev(m + "-01", lastDay(m));
    if (obj && encM < obj) out.push(["info", `Pour ton objectif du mois, il manque ${F(obj - encM)}.`]);
    else if (obj && encM >= obj) out.push(["good", `Objectif du mois atteint : ${F(encM)} encaissés.`]);
    const aCreer = DB.plateformes.filter(x => x.statut === "À créer").length;
    if (aCreer) out.push(["info", `${aCreer} plateforme(s) encore à créer.`]);
    if (usdMissing()) out.push(["warn", "Des montants sont en dollars mais le taux $ → F n'est pas renseigné (Réglages)."]);
    const last = DB.reglages.lastExport;
    if (!last || (Date.now() - new Date(last)) / 864e5 > 7) out.push(["warn", last ? `Dernière sauvegarde le ${dmy(last)}/${last.slice(0, 4)} : pense à en refaire une.` : "Tu n'as encore jamais téléchargé de sauvegarde."]);
    if (!out.length) out.push(["good", "Tout est à jour. Bon travail !"]);
    const ic = { bad: ICON.alert, warn: ICON.alert, info: ICON.info, good: ICON.ok };
    $("#insights").innerHTML = out.slice(0, 7).map(([k, txt]) => `<li class="${k}">${ic[k]}<span>${esc(txt)}</span></li>`).join("");
  }

  function renderCash() {
    const end = ym(today()), ms = Array.from({ length: 12 }, (_, i) => addMonths(end, i - 11));
    let bal = sumRev("0000", addMonths(ms[0], -1) + "-31") - sumDep("0000", addMonths(ms[0], -1) + "-31");
    const pts = ms.map(m => (bal += sumRev(m + "-01", lastDay(m)) - sumDep(m + "-01", lastDay(m))));
    const W = 640, H = 220, P = { l: 8, r: 8, t: 18, b: 26 };
    const lo = Math.min(0, ...pts), hi = Math.max(0, ...pts), span = hi - lo || 1;
    const x = i => P.l + (i * (W - P.l - P.r)) / (ms.length - 1), y = v => P.t + ((hi - v) * (H - P.t - P.b)) / span;
    const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    const area = `${line}L${x(ms.length - 1).toFixed(1)},${y(lo).toFixed(1)}L${x(0).toFixed(1)},${y(lo).toFixed(1)}Z`;
    const neg = pts[pts.length - 1] < 0;
    $("#cash").innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="cash-svg${neg ? " neg" : ""}" role="img" aria-label="Trésorerie cumulée sur 12 mois, solde actuel ${esc(sF(pts[pts.length - 1]))}">
      <defs><linearGradient id="cashg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient>
      <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hl"/></pattern></defs>
      ${[0.25, 0.5, 0.75].map(f => `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${(P.t + f * (H - P.t - P.b)).toFixed(1)}" y2="${(P.t + f * (H - P.t - P.b)).toFixed(1)}"/>`).join("")}
      ${lo < 0 ? `<line class="zero" x1="${P.l}" x2="${W - P.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>` : ""}
      <path d="${area}" class="area"/><path d="${area}" class="area-h"/><path d="${line}" class="ln"/>
      ${ms.map((m, i) => `<text x="${x(i).toFixed(1)}" y="${H - 6}" class="ax" text-anchor="${i === 0 ? "start" : i === ms.length - 1 ? "end" : "middle"}">${i % 2 === ms.length % 2 || i === ms.length - 1 ? esc(MOIS[+m.slice(5) - 1]) : ""}</text>`).join("")}
      <line class="cross" id="cash-x" x1="0" x2="0" y1="${P.t}" y2="${H - P.b}" visibility="hidden"/>
      <circle r="5" class="dot" id="cash-dot" visibility="hidden"/>
      <circle r="5" class="dot end" cx="${x(ms.length - 1).toFixed(1)}" cy="${y(pts[pts.length - 1]).toFixed(1)}"/>
      <rect x="0" y="0" width="${W}" height="${H}" fill="transparent" id="cash-hit"/>
    </svg><p class="cash-now"><span class="hint">Solde cumulé aujourd'hui</span><b class="${neg ? "negc" : ""}">${esc(sF(pts[pts.length - 1]))}</b></p>`;
    const svg = $("#cash svg"), hit = $("#cash-hit"), cx = $("#cash-x"), dot = $("#cash-dot");
    const move = ev => {
      const r = svg.getBoundingClientRect(), px = ((ev.clientX - r.left) / r.width) * W;
      const i = Math.max(0, Math.min(ms.length - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (ms.length - 1))));
      cx.setAttribute("x1", x(i)); cx.setAttribute("x2", x(i)); cx.setAttribute("visibility", "visible");
      dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(pts[i])); dot.setAttribute("visibility", "visible");
      showTipAt(r.left + (x(i) / W) * r.width, r.top + (y(pts[i]) / H) * r.height, `${MOIS_L[+ms[i].slice(5) - 1]} ${ms[i].slice(0, 4)} · solde`, sF(pts[i]));
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", () => { cx.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); hideTip(); });
  }

  function renderSplit(R) {
    $$("#split-seg button").forEach(b => b.classList.toggle("on", b.dataset.r === UI.split));
    const agg = {};
    if (UI.split === "src") DB.revenus.filter(x => x.statut === "Encaissé" && inR(x.date, R.s, R.e)).forEach(x => (agg[x.source || "Autre"] = (agg[x.source || "Autre"] || 0) + toF(x)));
    if (UI.split === "cat") DB.depenses.filter(x => inR(x.date, R.s, R.e)).forEach(x => (agg[x.categorie || "Autre"] = (agg[x.categorie || "Autre"] || 0) + toF(x)));
    if (UI.split === "type") DB.projets.filter(x => x.statut !== "Annulé").forEach(x => (agg[x.type || "Autre"] = (agg[x.type || "Autre"] || 0) + (+x.montant || 0)));
    const rows = Object.entries(agg).sort((a, b) => b[1] - a[1]), tot = rows.reduce((a, r) => a + r[1], 0);
    const what = { src: "revenu encaissé", cat: "dépense", type: "projet" }[UI.split];
    $("#split").innerHTML = rows.length ? `<p class="split-total"><b>${esc(F(tot))}</b><span class="hint">${UI.split === "type" ? "toutes périodes" : esc(R.lbl)}</span></p>` + rows.slice(0, 6).map(([s, v], i) => `<div class="src c${i % 4}"><div class="src-top"><span>${esc(s)}</span><b>${esc(F(v))} <em>${Math.round((v / tot) * 100)} %</em></b></div><div class="track"><i data-w="${((v / tot) * 100).toFixed(1)}"></i></div></div>`).join("")
      : `<p class="empty">Aucun ${what} sur ${UI.split === "type" ? "l'ensemble" : esc(R.lbl)}.</p>`;
  }

  function renderProjets() {
    const t = today(), list = DB.projets.filter(x => ["En cours", "Livré", "Devis"].includes(x.statut)).sort((a, b) => (a.livraison || "9").localeCompare(b.livraison || "9"));
    const reste = list.reduce((a, x) => a + Math.max(0, (+x.montant || 0) - (+x.encaisse || 0)), 0);
    $("#proj-hint").textContent = list.length ? `${list.length} projet(s) · ${F(reste)} à encaisser` : "";
    $("#proj-list").innerHTML = list.length ? list.slice(0, 6).map(x => {
      const av = Math.max(0, Math.min(100, +x.avancement || 0)), late = x.statut === "En cours" && x.livraison && x.livraison < t;
      const paid = +x.montant ? Math.round(((+x.encaisse || 0) / +x.montant) * 100) : 0;
      return `<div class="proj" data-open="projets" data-oid="${esc(x.id)}" tabindex="0">
        <div class="proj-top"><b>${esc(x.nom)}</b><span class="st ${L.projets.ton[x.statut] || "neutral"}">${esc(x.statut)}</span></div>
        <div class="proj-meta"><span>${esc(x.client || "Client non renseigné")}${x.type ? " · " + esc(x.type) : ""}</span><span class="${late ? "negc" : ""}">${x.livraison ? (late ? "En retard · " : "Livraison ") + esc(dmy(x.livraison)) : ""}</span></div>
        <div class="proj-bars"><div><span class="hint">Avancement ${av} %</span><div class="track"><i data-w="${av}"></i></div></div>
        <div><span class="hint">Payé ${paid} % · ${esc(F(+x.encaisse || 0))} / ${esc(F(+x.montant || 0))}</span><div class="track pay"><i data-w="${Math.min(paid, 100)}"></i></div></div></div></div>`;
    }).join("") : `<p class="empty">Aucun projet en cours. Ajoute ton prochain client avec le bouton +.</p>`;
  }

  function events() {
    const ev = [];
    DB.pipeline.filter(x => ACTIVE(x) && x.echeance).forEach(x => ev.push({ d: x.echeance, txt: `${x.nom}${x.prochaine ? " : " + x.prochaine : ""}`, k: "opp", l: "Opportunité", ref: ["pipeline", x.id] }));
    DB.taches.filter(x => !x.fait && x.echeance).forEach(x => ev.push({ d: x.echeance, txt: x.texte, k: "tache", l: "Tâche", ref: ["taches", x.id] }));
    DB.projets.filter(x => ["Devis", "En cours", "Livré"].includes(x.statut) && x.livraison).forEach(x => ev.push({ d: x.livraison, txt: `Livraison : ${x.nom}`, k: "prj", l: "Projet", ref: ["projets", x.id] }));
    DB.depenses.filter(x => x.statut === "À payer").forEach(x => ev.push({ d: x.date || today(), txt: `Payer ${F(toF(x))} · ${x.desc || x.categorie || ""}`, k: "dep", l: "Dépense", ref: ["depenses", x.id] }));
    return ev.sort((a, b) => a.d.localeCompare(b.d));
  }
  const evLi = x => `<li class="${x.d < today() ? "late" : ""}" data-open="${x.ref[0]}" data-oid="${esc(x.ref[1])}" tabindex="0"><i class="kdot ${x.k}"></i><span class="d">${x.d < today() ? "En retard" : esc(dmy(x.d))}</span><span class="txt">${esc(x.txt)}</span><span class="k">${esc(x.l)}</span></li>`;

  function renderCal() {
    const m = UI.cal, first = new Date(+m.slice(0, 4), +m.slice(5) - 1, 1), offset = (first.getDay() + 6) % 7, n = +lastDay(m).slice(8);
    $("#cal-title").textContent = `${MOIS_L[+m.slice(5) - 1].replace(/^./, c => c.toUpperCase())} ${m.slice(0, 4)}`;
    const ev = events(), byDay = {}; ev.forEach(e => (byDay[e.d] = byDay[e.d] || []).push(e));
    let h = ["L", "M", "M", "J", "V", "S", "D"].map(d => `<span class="dow">${d}</span>`).join("") + "<span></span>".repeat(offset);
    for (let i = 1; i <= n; i++) {
      const d = `${m}-${pad(i)}`, e = byDay[d] || [];
      h += `<button class="day${d === today() ? " today" : ""}${d === UI.calDay ? " sel" : ""}${e.length ? " has" : ""}" data-day="${d}" aria-label="${i} ${MOIS_L[+m.slice(5) - 1]}${e.length ? ", " + e.length + " élément(s)" : ""}"><span>${i}</span><span class="dd">${e.slice(0, 3).map(x => `<i class="kdot ${x.k}"></i>`).join("")}</span></button>`;
    }
    $("#cal").innerHTML = h;
    const sel = byDay[UI.calDay] || [];
    $("#cal-day").innerHTML = `<li class="cal-legend"><span><i class="kdot tache"></i>Tâche</span><span><i class="kdot opp"></i>Opportunité</span><span><i class="kdot prj"></i>Projet</span><span><i class="kdot dep"></i>Dépense</span></li>` +
      (sel.length ? sel.map(evLi).join("") : `<li class="empty">Rien le ${esc(dmy(UI.calDay))}.</li>`);
  }

  function renderAgenda() {
    const lim = new Date(); lim.setDate(lim.getDate() + 14);
    const items = events().filter(x => x.d <= iso(lim)).slice(0, 9);
    $("#agenda").innerHTML = items.length ? items.map(evLi).join("") : `<li class="empty">Rien d'urgent dans les 14 prochains jours.</li>`;
    $("#plat").innerHTML = DB.plateformes.length ? DB.plateformes.map(p => `<li data-open="plateformes" data-oid="${esc(p.id)}" tabindex="0"><span>${esc(p.nom)}</span><span class="k st ${L.plateformes.ton[p.statut] || "neutral"}">${esc(p.statut)}</span></li>`).join("") : `<li class="empty">Aucune plateforme suivie.</li>`;
    const ago = s => { const m = Math.round((Date.now() - new Date(s)) / 6e4); return m < 1 ? "à l'instant" : m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
    $("#journal").innerHTML = DB.journal.length ? DB.journal.slice(-7).reverse().map(j => `<li><span class="txt">${esc(j.txt)}</span><span class="k">${esc(ago(j.t))}</span></li>`).join("") : `<li class="empty">Aucune activité enregistrée.</li>`;
  }

  function renderVue() {
    const R = range(UI.period);
    $$("#period button").forEach(b => b.classList.toggle("on", b.dataset.p === UI.period));
    $("#period-lbl").innerHTML = `<b>${esc(R.lbl.replace(/^./, c => c.toUpperCase()))}</b>${R.cmp ? ` · comparé à ${esc(R.cmp)}` : ""}`;
    renderKPIs(R); renderFlow(R); renderGoal(); renderFunnel(); insights(R); renderCash(); renderSplit(R); renderProjets(); renderCal(); renderAgenda();
    $("#privacy-txt").textContent = K ? "Tes données sont chiffrées (AES-256) dans ce navigateur et ne sont jamais envoyées sur Internet. Le tableau se reverrouille après 15 minutes d'inactivité."
      : "Tes données restent dans ce navigateur, sur cet appareil, et ne sont jamais envoyées sur Internet. Active le chiffrement dans Réglages pour les protéger par mot de passe.";
  }

  // ════════ LISTES ════════
  const lst = name => (UI.lists[name] ||= { q: "", filter: name === "taches" ? "À faire" : "Tous", sort: L[name].sort ? [...L[name].sort] : null });
  function filtered(name) {
    const S = L[name], st = lst(name), t = today(), q = st.q.trim().toLowerCase();
    let rows = DB[name].filter(x => !q || Object.values(x).some(v => typeof v === "string" && v.toLowerCase().includes(q)));
    if (name === "taches") rows = rows.filter(x => st.filter === "Tous" ? true : st.filter === "Faites" ? x.fait : st.filter === "En retard" ? !x.fait && x.echeance && x.echeance < t : !x.fait);
    else { const sf = S.f.find(f => f.st); if (sf && st.filter !== "Tous") rows = rows.filter(x => x[sf.k] === st.filter); }
    if (st.sort) {
      const [k, dir] = st.sort, f = S.f.find(f => f.k === k);
      rows.sort((a, b) => {
        let va = a[k], vb = b[k];
        if (f && (f.t === "number")) { va = f.money && (name === "revenus" || name === "depenses") ? toF(a) : +va || 0; vb = f.money && (name === "revenus" || name === "depenses") ? toF(b) : +vb || 0; return (va - vb) * dir; }
        if (k === "priorite") { const o = { Haute: 0, Normale: 1, Basse: 2 }; return ((o[va] ?? 1) - (o[vb] ?? 1)) * dir; }
        va = va || (dir > 0 ? "￿" : ""); vb = vb || (dir > 0 ? "￿" : "");
        return String(va).localeCompare(String(vb), "fr") * dir;
      });
    }
    if (name === "taches") rows.sort((a, b) => a.fait - b.fait);
    return rows;
  }
  function cell(name, x, f) {
    const S = L[name];
    if (f.st) return `<select class="inline ${S.ton[x[f.k]] || "neutral"}" data-edit="${f.k}" aria-label="${esc(f.l)}">${f.o.map(o => `<option${o === x[f.k] ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    if (f.k === "montant" && (name === "revenus" || name === "depenses")) {
      const fx = x.devise && x.devise !== "F";
      return `${esc(F(toF(x)))}${fx ? `<span class="small-note">${esc(num(x.montant))} ${x.devise === "EUR" ? "€" : "$"}${x.devise === "USD" && !(+DB.reglages.tauxUSD) ? " · taux manquant" : ""}</span>` : ""}`;
    }
    if (f.k === "avancement") { const v = Math.max(0, Math.min(100, +x.avancement || 0)); return `<div class="mini"><div class="track"><i data-w="${v}"></i></div><span>${v} %</span></div>`; }
    if (f.money) return x[f.k] ? esc(F(x[f.k])) : `<span class="hint">—</span>`;
    if (f.t === "date") { const late = x[f.k] && x[f.k] < today() && ((name === "pipeline" && ACTIVE(x)) || (name === "projets" && x.statut === "En cours" && f.k === "livraison")); return x[f.k] ? `<span class="${late ? "negc" : ""}">${esc(dmy(x[f.k]))}</span><span class="small-note">${esc(x[f.k].slice(0, 4))}</span>` : ""; }
    if (f.k === "lien") return /^https:\/\/[^\s"'<>]+$/.test(x.lien || "") ? `<a href="${esc(x.lien)}" target="_blank" rel="noopener noreferrer">Ouvrir le profil</a>` : esc(x.lien);
    if (f.k === "priorite") return x.priorite ? `<span class="prio ${x.priorite === "Haute" ? "hi" : x.priorite === "Basse" ? "lo" : ""}">${esc(x.priorite)}</span>` : "";
    return esc(x[f.k]);
  }
  function renderList(name) {
    const S = L[name], st = lst(name), box = $(`[data-list="${name}"]`), rows = filtered(name), cols = S.f.filter(f => f.col);
    const sf = S.f.find(f => f.st), chips = S.filters || (sf ? ["Tous", ...sf.o] : []);
    const count = c => name === "taches" ? DB.taches.filter(x => c === "Tous" ? true : c === "Faites" ? x.fait : c === "En retard" ? !x.fait && x.echeance && x.echeance < today() : !x.fait).length : c === "Tous" ? DB[name].length : DB[name].filter(x => x[sf.k] === c).length;
    const total = S.sum ? rows.reduce((a, x) => a + S.sum(x), 0) : null;
    const hadFocus = document.activeElement && document.activeElement.matches(`[data-search="${name}"]`);
    box.innerHTML = `
      <div class="toolbar glass">
        <label class="search">${ICON.search}<input type="search" data-search="${name}" placeholder="Rechercher…" value="${esc(st.q)}" aria-label="Rechercher dans ${esc(S.titre)}"></label>
        <div class="chips">${chips.map(c => `<button class="fchip${st.filter === c ? " on" : ""}" data-filter="${esc(c)}">${esc(c)} <em>${count(c)}</em></button>`).join("")}</div>
        <div class="tool-actions"><button class="btn ghost sm" data-csv="${name}">${ICON.csv}CSV</button><button class="btn sm" data-new="${name}">+ ${esc(S.one.replace(/^./, c => c.toUpperCase()))}</button></div>
      </div>
      <div class="glass tablecard"><table class="tbl">
        <thead><tr>${name === "taches" ? "<th></th>" : ""}${cols.map(f => `<th class="${f.money || f.t === "number" ? "num " : ""}sortable" data-sort="${f.k}" aria-sort="${st.sort && st.sort[0] === f.k ? (st.sort[1] > 0 ? "ascending" : "descending") : "none"}">${esc(f.l.replace(/ \(.*\)$/, ""))}${st.sort && st.sort[0] === f.k ? (st.sort[1] > 0 ? " ↑" : " ↓") : ""}</th>`).join("")}<th></th></tr></thead>
        <tbody>${rows.length ? rows.map(x => `<tr data-id="${esc(x.id)}" class="${name === "taches" && x.fait ? "done" : ""}">${name === "taches" ? `<td class="chk"><input type="checkbox" data-done${x.fait ? " checked" : ""} aria-label="Marquer comme faite"></td>` : ""}${cols.map(f => `<td class="${f.money || f.t === "number" ? "num" : ""}${f.k === cols[0].k ? " main" : ""}">${cell(name, x, f)}</td>`).join("")}
          <td class="row-act"><button class="del" data-edit-row aria-label="Modifier">${ICON.edit}</button><button class="del" data-del aria-label="Supprimer">${ICON.del}</button></td></tr>`).join("")
        : `<tr><td colspan="${cols.length + 2}" class="empty">${DB[name].length ? "Aucune ligne ne correspond à ta recherche ou au filtre." : `Aucun(e) ${esc(S.one)} pour l'instant.`}</td></tr>`}</tbody>
        ${total !== null && rows.length ? `<tfoot><tr><td colspan="${cols.length}">${esc(S.sumLbl)} · ${rows.length} ligne(s)</td><td class="num">${esc(F(total))}</td></tr></tfoot>` : ""}
      </table></div>`;
    if (hadFocus) { const i = $(`[data-search="${name}"]`); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    applyDims(box);
  }

  function renderBadges() {
    const t = today();
    const b = {
      projets: DB.projets.filter(x => x.statut === "En cours" && x.livraison && x.livraison < t).length,
      pipeline: DB.pipeline.filter(x => ACTIVE(x) && x.echeance && x.echeance <= t).length,
      taches: DB.taches.filter(x => !x.fait && x.echeance && x.echeance <= t).length,
    };
    $$("[data-badge]").forEach(el => { const n = b[el.dataset.badge] || 0; el.textContent = n || ""; el.hidden = !n; });
  }

  function renderSettings() {
    const f = $("#set-form");
    if (!(document.activeElement && f.contains(document.activeElement) && document.activeElement.tagName === "INPUT")) {
      f.objectif.value = DB.reglages.objectif || ""; f.objectifAn.value = DB.reglages.objectifAn || ""; f.tauxUSD.value = DB.reglages.tauxUSD || "";
    }
    $("#lock-state").textContent = K ? "Chiffrement activé : tes données sont protégées par ton mot de passe (AES-256-GCM)." : GMCrypto.available ? "Chiffrement désactivé : tes données sont lisibles par toute personne qui utilise ce navigateur." : "Le chiffrement n'est pas disponible dans ce navigateur (page non sécurisée).";
    $("#lock-set-btn").textContent = K ? "Changer le mot de passe" : "Activer le chiffrement";
    $("#lock-off").hidden = !K; $("#btn-lock").hidden = !K;
    const n = LISTS.reduce((a, k) => a + DB[k].length, 0);
    $("#data-state").textContent = `${n} élément(s) enregistrés. ${DB.reglages.lastExport ? `Dernière sauvegarde : ${dmy(DB.reglages.lastExport)}/${DB.reglages.lastExport.slice(0, 4)}.` : "Aucune sauvegarde téléchargée pour l'instant."}`;
  }

  function render() {
    renderVue();
    for (const n of LISTS) renderList(n);
    $$("#fin-seg button").forEach(b => b.classList.toggle("on", b.dataset.l === UI.fin));
    $('[data-list="revenus"]').hidden = UI.fin !== "revenus"; $('[data-list="depenses"]').hidden = UI.fin !== "depenses";
    renderBadges(); renderSettings(); applyDims();
  }

  // ════════ FENÊTRE AJOUT / MODIFICATION ════════
  const modal = $("#modal");
  let editing = null;
  function openModal(name, id) {
    const S = L[name], x = id ? DB[name].find(y => y.id === id) : null;
    if (id && !x) return;
    editing = { name, id };
    $("#modal-title").textContent = (x ? "Modifier : " : "Nouveau : ") + S.one;
    const t = today();
    $("#modal-body").innerHTML = S.f.map(f => {
      const v = x ? x[f.k] ?? "" : f.t === "date" && ["date"].includes(f.k) ? t : f.t === "select" ? (name === "pipeline" && f.k === "etape" ? "À contacter" : f.o[0]) : "";
      const inp = f.t === "select"
        ? `<select name="${f.k}">${f.o.map(o => `<option${o === v ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`
        : `<input name="${f.k}" type="${f.t === "url" ? "url" : f.t}" value="${esc(v)}"${f.req ? " required" : ""}${f.t === "number" ? ` min="0"${f.max ? ` max="${f.max}"` : ""} step="any" inputmode="decimal"` : ""}${f.t === "text" || f.t === "url" ? ' maxlength="300"' : ""}${f.t === "url" ? ' pattern="https://.+" placeholder="https://"' : ""}>`;
      return `<label class="field${f.t === "text" && ["desc", "prochaine", "notes", "texte", "nom"].includes(f.k) ? " wide" : ""}">${esc(f.l)}${f.req ? " *" : ""}${inp}</label>`;
    }).join("");
    $("#modal-note").textContent = name === "revenus" || name === "depenses" ? `Montant en euros converti à ${EUR} F ; en dollars au taux de Réglages${+DB.reglages.tauxUSD ? ` (${DB.reglages.tauxUSD} F)` : " (non renseigné)"}.` : name === "projets" ? "Astuce : 50 % à la commande, 50 % à la livraison. Mets à jour « Déjà encaissé » à chaque paiement." : "";
    modal.showModal();
    const first = $("#modal-body input, #modal-body select"); if (first) first.focus();
  }
  function closeModal() { modal.close(); editing = null; }
  $("#modal-form").addEventListener("submit", e => {
    e.preventDefault(); if (!editing) return;
    const { name, id } = editing, S = L[name], fd = new FormData(e.target), x = id ? DB[name].find(y => y.id === id) : { id: uid() };
    for (const f of S.f) {
      let v = String(fd.get(f.k) ?? "").trim().slice(0, 300);
      if (f.t === "number") v = Math.min(f.max ?? Infinity, Math.max(0, Number(v.replace(",", ".")) || 0));
      if (f.t === "select" && !f.o.includes(v)) v = f.o[0];
      if (f.t === "url" && v && !/^https:\/\/[^\s"'<>]+$/.test(v)) return toast("Le lien doit commencer par https://");
      if (f.t === "date" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) v = "";
      x[f.k] = v;
    }
    if (name === "taches" && !id) x.fait = false;
    if (!id) DB[name].push(x);
    closeModal();
    commit(`${id ? "Modifié" : "Ajouté"} : ${S.one} « ${x.nom || x.texte || x.desc || x.source || ""} »`);
    toast(id ? "Modifié." : "Ajouté.");
  });
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal-cancel").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  // ════════ INTERACTIONS ════════
  const rowCtx = el => { const row = el.closest("[data-id]"), box = el.closest("[data-list]"); return row && box ? { name: box.dataset.list, id: row.dataset.id, row } : null; };
  document.addEventListener("click", e => {
    const t = e.target;
    const tab = t.closest("#tabs .tab"); if (tab) return show(tab.dataset.tab);
    const p = t.closest("#period button"); if (p) { UI.period = p.dataset.p; saveUI(); return renderVue(), applyDims(); }
    const s = t.closest("#flow-seg button"); if (s) { UI.flow = s.dataset.s; saveUI(); renderFlow(range(UI.period)); return applyDims($("#flow-steps")); }
    const r = t.closest("#split-seg button"); if (r) { UI.split = r.dataset.r; saveUI(); renderSplit(range(UI.period)); return applyDims($("#split")); }
    const fl = t.closest("#fin-seg button"); if (fl) { UI.fin = fl.dataset.l; saveUI(); return render(); }
    const day = t.closest("[data-day]"); if (day) { UI.calDay = day.dataset.day; return renderCal(); }
    if (t.closest("#cal-prev")) { UI.cal = addMonths(UI.cal, -1); return renderCal(); }
    if (t.closest("#cal-next")) { UI.cal = addMonths(UI.cal, 1); return renderCal(); }
    const open = t.closest("[data-open]"); if (open) return openModal(open.dataset.open, open.dataset.oid);
    const nw = t.closest("[data-new]"); if (nw) { $("#fab-menu").hidden = true; return openModal(nw.dataset.new); }
    if (t.closest("#fab")) { const m = $("#fab-menu"); m.hidden = !m.hidden; return; }
    if (!t.closest("#fab-menu")) $("#fab-menu").hidden = true;
    const fc = t.closest("[data-filter]"); if (fc) { const c = rowCtx(fc) || { name: fc.closest("[data-list]").dataset.list }; lst(c.name).filter = fc.dataset.filter; return renderList(c.name); }
    const so = t.closest("[data-sort]"); if (so) { const n = so.closest("[data-list]").dataset.list, st = lst(n); st.sort = st.sort && st.sort[0] === so.dataset.sort ? [so.dataset.sort, -st.sort[1]] : [so.dataset.sort, 1]; return renderList(n); }
    const csv = t.closest("[data-csv]"); if (csv) return exportCSV(csv.dataset.csv);
    const ed = t.closest("[data-edit-row]"); if (ed) { const c = rowCtx(ed); return openModal(c.name, c.id); }
    const del = t.closest("[data-del]"); if (del) {
      const c = rowCtx(del), x = DB[c.name].find(y => y.id === c.id); if (!x) return;
      if (!confirm("Supprimer cette ligne ? Cette action est définitive (sauf sauvegarde).")) return;
      DB[c.name] = DB[c.name].filter(y => y.id !== c.id);
      return commit(`Supprimé : ${L[c.name].one} « ${x.nom || x.texte || x.desc || x.source || ""} »`);
    }
    const mainCell = t.closest("td.main"); if (mainCell && !t.closest("a,select,input")) { const c = rowCtx(mainCell); if (c) openModal(c.name, c.id); }
  });
  document.addEventListener("keydown", e => {
    const o = e.target.closest && e.target.closest("[data-open]");
    if (o && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); return openModal(o.dataset.open, o.dataset.oid); }
    if (e.target.matches("input, select, textarea") || modal.open || !$("#lock").hidden) return;
    if (e.key === "n" || e.key === "N") { e.preventDefault(); $("#fab-menu").hidden = false; $("#fab-menu button").focus(); }
    if (e.key === "/") { const s = $("[data-panel]:not([hidden]) [data-list]:not([hidden]) [data-search]"); if (s) { e.preventDefault(); s.focus(); } }
    if (e.key === "Escape") $("#fab-menu").hidden = true;
  });
  document.addEventListener("input", e => {
    const s = e.target.closest("[data-search]"); if (!s) return;
    lst(s.dataset.search).q = s.value.slice(0, 100);
    clearTimeout(renderList.t); renderList.t = setTimeout(() => renderList(s.dataset.search), 120);
  });
  document.addEventListener("change", e => {
    const c = rowCtx(e.target); if (!c) return;
    const x = DB[c.name].find(y => y.id === c.id); if (!x) return;
    if (e.target.matches("[data-edit]")) {
      const f = L[c.name].f.find(f => f.k === e.target.dataset.edit);
      if (!f || !f.o.includes(e.target.value)) return;
      x[f.k] = e.target.value;
      if (c.name === "projets" && x.statut === "Payé" && +x.montant) { x.encaisse = +x.montant; x.avancement = 100; }
      commit(`${L[c.name].one.replace(/^./, k => k.toUpperCase())} « ${x.nom || x.desc || x.source || ""} » → ${x[f.k]}`);
    } else if (e.target.matches("[data-done]")) { x.fait = e.target.checked; commit(`${x.fait ? "Terminé" : "Rouvert"} : « ${x.texte} »`); }
  });

  // info-bulles (textContent uniquement)
  const tip = $("#tip");
  function showTipAt(x, y, a, b) { const bb = document.createElement("b"); bb.textContent = b || ""; tip.replaceChildren(document.createTextNode((a || "") + " : "), bb); tip.hidden = false; tip.style.left = x + "px"; tip.style.top = y + "px"; }
  const hideTip = () => (tip.hidden = true);
  const tipFor = el => { const r = el.getBoundingClientRect(); showTipAt(r.left + r.width / 2, r.top + 8, el.dataset.tip, el.dataset.tipv); };
  document.addEventListener("pointerover", e => { const el = e.target.closest("[data-tip]"); if (el) tipFor(el); else if (!e.target.closest("#cash")) hideTip(); });
  document.addEventListener("focusin", e => { const el = e.target.closest("[data-tip]"); el ? tipFor(el) : hideTip(); });
  addEventListener("scroll", hideTip, { passive: true });

  function show(tab) {
    if (!$(`[data-panel="${tab}"]`)) tab = "vue";
    $$("#tabs .tab").forEach(t => { t.classList.toggle("on", t.dataset.tab === tab); t.setAttribute("aria-selected", t.dataset.tab === tab); });
    $$("[data-panel]").forEach(p => (p.hidden = p.dataset.panel !== tab));
    hideTip(); scrollTo(0, 0);
    try { sessionStorage.setItem(KEY + "-tab", tab); } catch (e) {}
  }
  $("#btn-theme").addEventListener("click", () => window.GMTheme && GMTheme.toggle());
  $("#btn-print").addEventListener("click", () => { show("vue"); setTimeout(() => print(), 50); });

  // ════════ RÉGLAGES ════════
  $("#set-form").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target;
    DB.reglages.objectif = Math.max(0, Number(f.objectif.value) || 0);
    DB.reglages.objectifAn = Math.max(0, Number(f.objectifAn.value) || 0);
    DB.reglages.tauxUSD = Math.max(0, Number(String(f.tauxUSD.value).replace(",", ".")) || 0);
    f.querySelector("button").focus();
    commit("Réglages mis à jour"); toast("Réglages enregistrés.");
  });
  $("#lock-set").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target;
    if (!GMCrypto.available) return toast("Chiffrement indisponible dans ce navigateur.");
    if (f.p1.value.length < 8) return toast("8 caractères minimum.");
    if (f.p1.value !== f.p2.value) return toast("Les deux mots de passe sont différents.");
    const was = !!K; K = await GMCrypto.newKey(f.p1.value); f.reset();
    log(was ? "Mot de passe changé" : "Chiffrement activé"); await persist(); render(); armIdle();
    toast(was ? "Mot de passe changé." : "Chiffrement activé. Garde une sauvegarde !");
  });
  $("#lock-off").addEventListener("click", async () => {
    if (!confirm("Désactiver le chiffrement ? Tes données seront de nouveau lisibles en clair dans ce navigateur.")) return;
    K = null; delete DB.reglages.ghToken; // le jeton GitHub n'est jamais conservé en clair
    log("Chiffrement désactivé"); await persist(); render(); toast("Chiffrement désactivé (jeton GitHub oublié).");
  });
  $("#btn-wipe").addEventListener("click", async () => {
    if (!confirm("Effacer TOUTES les données de ce navigateur ?")) return;
    if (prompt('Tape EFFACER pour confirmer') !== "EFFACER") return toast("Annulé.");
    await writing; try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  });

  // ════════ SAUVEGARDE / IMPORT / CSV ════════
  function download(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  async function exportAll() {
    DB.reglages.lastExport = today(); log(K ? "Sauvegarde chiffrée téléchargée" : "Sauvegarde téléchargée");
    const plain = JSON.parse(JSON.stringify(DB)); delete plain.reglages.ghToken; // jamais de jeton dans une sauvegarde en clair
    const payload = K ? await GMCrypto.encrypt(K, DB) : plain;
    download(`tableau-de-bord-${today()}${K ? "-chiffre" : ""}.json`, JSON.stringify(payload, null, 1), "application/json");
    persist(); render(); toast(K ? "Sauvegarde chiffrée téléchargée." : "Sauvegarde téléchargée : garde-la en lieu sûr.");
  }
  $("#btn-export").addEventListener("click", exportAll);
  $("#btn-export2").addEventListener("click", exportAll);
  function exportCSV(name) {
    const S = L[name], rows = filtered(name);
    const cells = S.f.map(f => f.l).concat(name === "revenus" || name === "depenses" ? ["Montant en F"] : []).concat(name === "taches" ? ["Faite"] : []);
    const safe = v => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cells.map(safe).join(";")].concat(rows.map(x => S.f.map(f => x[f.k]).concat(name === "revenus" || name === "depenses" ? [Math.round(toF(x))] : []).concat(name === "taches" ? [x.fait ? "oui" : "non"] : []).map(safe).join(";")));
    download(`${name}-${today()}.csv`, "﻿" + lines.join("\r\n"), "text/csv;charset=utf-8");
    toast(`${rows.length} ligne(s) exportée(s).`);
  }
  let pendingImport = null;
  $("#file-import").addEventListener("change", async e => {
    const file = e.target.files[0]; e.target.value = ""; if (!file) return;
    if (file.size > 3e6) return toast("Fichier trop gros pour être une sauvegarde.");
    let d; try { d = JSON.parse(await file.text()); } catch (err) { return toast("Ce fichier n'est pas une sauvegarde valide."); }
    if (GMCrypto.isEnc(d)) { pendingImport = d; return showLock("import"); }
    if (!d || typeof d !== "object" || ![...LISTS, "reglages"].some(k => d[k])) return toast("Ce fichier n'est pas une sauvegarde du tableau de bord.");
    replaceWith(d);
  });
  function replaceWith(d) {
    const n = LISTS.reduce((a, k) => a + DB[k].length, 0);
    if (n && !confirm("Remplacer les données de ce navigateur par celles du fichier ?")) return;
    const keepExport = DB.reglages.lastExport;
    DB = clean(d); if (!DB.reglages.lastExport) DB.reglages.lastExport = keepExport;
    commit("Sauvegarde importée"); toast("Données importées.");
  }

  // ════════ VERROUILLAGE ════════
  let mode = "boot", stored = null, idleT = null;
  function showLock(m) {
    mode = m; $("#lock").hidden = false; $("#lock-err").hidden = true; $("#lock-pass").value = "";
    $("#lock-title").textContent = m === "import" ? "Sauvegarde chiffrée" : "Tableau de bord verrouillé";
    $("#lock-sub").textContent = m === "import" ? "Saisis le mot de passe de cette sauvegarde pour l'importer." : "Saisis ton mot de passe pour déchiffrer tes données.";
    $("#lock-cancel").hidden = m !== "import";
    document.body.classList.toggle("locked", m !== "import");
    setTimeout(() => $("#lock-pass").focus(), 30);
  }
  function hideLock() { $("#lock").hidden = true; document.body.classList.remove("locked"); }
  $("#lock-cancel").addEventListener("click", () => { pendingImport = null; hideLock(); });
  $("#lock-form").addEventListener("submit", async e => {
    e.preventDefault();
    const pass = $("#lock-pass").value, btn = $("#lock-form .btn"); btn.disabled = true;
    try {
      const { obj, k } = await GMCrypto.decrypt(pass, mode === "import" ? pendingImport : stored);
      $("#lock-pass").value = "";
      if (mode === "import") { hideLock(); pendingImport = null; replaceWith(obj); }
      else { DB = clean(obj); K = k; hideLock(); start(); }
    } catch (err) { $("#lock-err").hidden = false; $("#lock-pass").select(); }
    finally { btn.disabled = false; }
  });
  function armIdle() {
    if (!K) return;
    const reset = () => { clearTimeout(idleT); idleT = setTimeout(() => location.reload(), 15 * 60 * 1000); };
    ["pointerdown", "keydown", "scroll"].forEach(ev => addEventListener(ev, reset, { passive: true }));
    reset();
  }
  $("#btn-lock").addEventListener("click", () => location.reload());

  // Coffre minimal pour l'éditeur du portfolio : le jeton GitHub n'est retenu que si les données sont chiffrées
  window.GMVault = Object.freeze({
    get: () => (K && DB.reglages.ghToken) || "",
    set: v => { if (!K) return false; if (v) DB.reglages.ghToken = String(v).slice(0, 255); else delete DB.reglages.ghToken; persist(); return true; },
    encrypted: () => !!K,
    log: txt => commit(txt),
  });

  // ════════ DÉMARRAGE ════════
  function start() {
    render();
    let tab = "vue"; try { tab = sessionStorage.getItem(KEY + "-tab") || "vue"; } catch (e) {}
    show(tab); armIdle();
  }
  let raw = null; try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (GMCrypto.isEnc(raw)) { stored = raw; showLock("boot"); }
  else { DB = clean(raw); start(); }
})();
