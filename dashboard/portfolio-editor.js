// Éditeur du portfolio public : modifie content/portfolio.js et le publie sur GitHub (Vercel redéploie tout seul).
// Brouillon gardé dans ce navigateur ; aperçu sur ../?apercu=1 ; publication via l'API GitHub avec un jeton personnel.
(function () {
  "use strict";
  const DRAFT = "gm-portfolio-draft", CONF = "gm-portfolio-conf";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const toast = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3200); };
  const root = $("#pf-root");
  if (!root) return;

  let PUB = window.PORTFOLIO && window.PORTFOLIO.version === 1 ? clone(window.PORTFOLIO) : null;
  let D = null;
  try { const d = JSON.parse(localStorage.getItem(DRAFT)); if (d && d.version === 1) D = d; } catch (e) {}
  if (!D && PUB) D = clone(PUB);
  let conf = { owner: "gasicidevshome", repo: "Oauttara-Yao-Sanhibou-Porfolio", branch: "main", path: "content/portfolio.js", history: [] };
  try { Object.assign(conf, JSON.parse(localStorage.getItem(CONF)) || {}); } catch (e) {}
  const saveConf = () => { try { localStorage.setItem(CONF, JSON.stringify(conf)); } catch (e) {} };
  let section = "accueil", sessionToken = "";

  // ════════ SCHÉMA DE L'ÉDITEUR ════════
  const COLORS = [["76,255,160", "Vert"], ["126,184,255", "Bleu"], ["255,179,209", "Rose"], ["255,229,102", "Jaune"], ["196,126,255", "Violet"]];
  const LINKS = [["github", "GitHub"], ["tiktok", "TikTok"], ["linkedin", "LinkedIn"], ["whatsapp", "WhatsApp"], ["web", "Site web"]];
  const entry = [
    { k: "title", l: "Titre", t: "text", wide: 1 }, { k: "date", l: "Dates", t: "text", ph: "2024 — PRÉSENT" }, { k: "subtitle", l: "Sous-titre", t: "text" },
    { k: "bullets", l: "Points clés (un par ligne)", t: "lines", wide: 1 }, { k: "tags", l: "Technos (séparées par des virgules)", t: "tags", wide: 1 },
  ];
  const skill = [{ k: "name", l: "Compétence", t: "text" }, { k: "level", l: "Niveau (%)", t: "number", min: 0, max: 100 }];
  const SECTIONS = [
    { id: "accueil", label: "Accueil", f: [
      { p: "hero.tag", l: "Bandeau au-dessus du titre", t: "text", wide: 1 },
      { p: "hero.intro", l: "Début du titre", t: "text" }, { p: "hero.name", l: "Nom mis en valeur (contour)", t: "text" },
      { p: "hero.line2", l: "Deuxième ligne", t: "text" }, { p: "hero.aliasIntro", l: "Avant le pseudo", t: "text" }, { p: "hero.alias", l: "Pseudo", t: "text" },
      { p: "hero.sub1", l: "Sous-titre ligne 1", t: "text", wide: 1 }, { p: "hero.sub2", l: "Sous-titre ligne 2", t: "text", wide: 1 },
      { p: "hero.btnProjects", l: "Bouton projets", t: "text" }, { p: "hero.btnCV", l: "Bouton CV", t: "text" }, { p: "hero.btnContact", l: "Bouton contact", t: "text" },
      { p: "stats", l: "Chiffres clés (accueil et À propos)", t: "list", max: 6, title: x => `${x.value ?? ""}${x.suffix ?? ""} ${x.label ?? ""}`, neu: () => ({ value: 0, suffix: "+", label: "Nouveau" }),
        item: [{ k: "value", l: "Nombre", t: "number", min: 0 }, { k: "suffix", l: "Suffixe", t: "text", ph: "+" }, { k: "label", l: "Libellé", t: "text" }] },
    ] },
    { id: "projets", label: "Projets", f: [
      { p: "projects.title", l: "Titre de la page", t: "text" }, { p: "projects.subtitle", l: "Sous-titre", t: "text" },
      { p: "projects.items", l: "Projets", t: "list", max: 40, title: x => `${x.num || ""} · ${x.name || "Sans nom"}${x.visible === false ? " (masqué)" : ""}`,
        neu: () => ({ num: "", name: "NOUVEAU PROJET", category: "", tags: [], url: "https://github.com/gasicidevshome", color: "76,255,160", visible: true }),
        item: [{ k: "num", l: "Numéro", t: "text", ph: "13" }, { k: "name", l: "Nom", t: "text" }, { k: "category", l: "Catégorie", t: "text" },
          { k: "url", l: "Lien (https://…)", t: "url", wide: 1 }, { k: "tags", l: "Technos (virgules)", t: "tags", wide: 1 },
          { k: "color", l: "Couleur au survol", t: "select", o: COLORS }, { k: "visible", l: "Afficher sur le site", t: "check" }] },
    ] },
    { id: "apropos", label: "À propos", f: [
      { p: "about.title", l: "Titre", t: "text" },
      { p: "about.paragraphs", l: "Paragraphes (mets **entre doubles étoiles** pour le gras)", t: "list", max: 8, title: x => String(x || "").slice(0, 70) + "…", neu: () => "Nouveau paragraphe.", scalar: "textarea" },
      { p: "about.ctaLabel", l: "Texte du lien", t: "text" }, { p: "about.ctaUrl", l: "Lien (mailto:, tel:, https://)", t: "url" },
      { p: "about.photo", l: "Photo", t: "photo", wide: 1 }, { p: "about.photoAlt", l: "Description de la photo", t: "text" }, { p: "about.spinText", l: "Texte qui tourne", t: "text" },
      { p: "about.skills", l: "Compétences (barres)", t: "list", max: 12, title: x => `${x.name || ""} · ${x.level ?? 0} %`, neu: () => ({ name: "Nouvelle compétence", level: 50 }), item: skill },
    ] },
    { id: "cv", label: "CV", f: [
      { p: "cv.title", l: "Titre", t: "text" }, { p: "cv.downloadLabel", l: "Bouton de téléchargement", t: "text" },
      { p: "cv.nameLines", l: "Nom (une ligne par mot)", t: "lines" }, { p: "cv.role", l: "Poste", t: "text" },
      { p: "cv.summary", l: "Résumé", t: "textarea", wide: 1 },
      { p: "cv.experienceTitle", l: "Titre expériences", t: "text" },
      { p: "cv.experience", l: "Expériences et projets", t: "list", max: 20, title: x => `${x.title || "Sans titre"} · ${x.date || ""}`, neu: () => ({ title: "Nouvelle expérience", date: "", subtitle: "", bullets: [], tags: [] }), item: entry },
      { p: "cv.educationTitle", l: "Titre formation", t: "text" },
      { p: "cv.education", l: "Formation", t: "list", max: 10, title: x => `${x.title || "Sans titre"} · ${x.date || ""}`, neu: () => ({ title: "Nouvelle formation", date: "", subtitle: "", bullets: [], tags: [] }), item: entry },
      { p: "cv.skills", l: "Compétences du CV", t: "list", max: 12, title: x => `${x.name || ""} · ${x.level ?? 0} %`, neu: () => ({ name: "Nouvelle compétence", level: 50 }), item: skill },
      { p: "cv.stack", l: "Stack (virgules)", t: "tags", wide: 1 }, { p: "cv.languages", l: "Langues (une par ligne)", t: "lines" }, { p: "cv.interests", l: "Intérêts (virgules)", t: "tags" },
    ] },
    { id: "contact", label: "Contact", f: [
      { p: "contact.big1", l: "Grand titre, début", t: "text" }, { p: "contact.bigEm", l: "Partie en contour", t: "text" }, { p: "contact.big2", l: "Deuxième ligne", t: "text" },
      { p: "contact.note", l: "Texte de présentation", t: "textarea", wide: 1 },
      { p: "contact.phone", l: "Téléphone", t: "text" }, { p: "contact.email", l: "E-mail", t: "email" },
      { p: "contact.location", l: "Localisation (page contact)", t: "text" }, { p: "contact.cvLocation", l: "Localisation (CV)", t: "text" },
      { p: "contact.links", l: "Liens (réseaux, sites)", t: "list", max: 10, title: x => `${(LINKS.find(o => o[0] === x.type) || ["", "Lien"])[1]} · ${x.label || x.url || ""}`, neu: () => ({ type: "web", label: "", url: "https://", menu: "", cvLabel: "" }),
        item: [{ k: "type", l: "Type", t: "select", o: LINKS }, { k: "url", l: "Lien (https://…)", t: "url", wide: 1 }, { k: "label", l: "Texte page contact", t: "text" }, { k: "menu", l: "Texte dans le menu (vide = absent)", t: "text" }, { k: "cvLabel", l: "Texte dans le CV (vide = absent)", t: "text" }] },
    ] },
    { id: "identite", label: "Identité & SEO", f: [
      { p: "brand.logo", l: "Logo (initiales)", t: "text", max: 4 }, { p: "brand.name", l: "Nom dans la barre", t: "text" },
      { p: "brand.preloader1", l: "Écran de chargement : mot 1", t: "text" }, { p: "brand.preloaderEm", l: "Mot en contour", t: "text" }, { p: "brand.preloader2", l: "Mot 3", t: "text" },
      { p: "brand.preloaderSub", l: "Sous-titre du chargement", t: "text" },
      { p: "meta.title", l: "Titre de l'onglet (Google)", t: "text", wide: 1 }, { p: "meta.description", l: "Description pour Google (≈ 155 caractères)", t: "textarea", wide: 1, max: 300 },
    ] },
    { id: "publier", label: "Publication", f: [] },
  ];

  // ════════ OUTILS DE CHEMIN ════════
  const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
  function set(o, p, v) { const ks = p.split("."); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null) a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; }
  function saveDraft() { try { localStorage.setItem(DRAFT, JSON.stringify(D)); } catch (e) { toast("Brouillon trop lourd pour ce navigateur (photo ?)."); } status(); }
  const dirty = () => PUB && D && !same(stripPreview(D), PUB);
  function stripPreview(o) { const c = clone(o); if (c.about) delete c.about.photoPreview; return c; }

  // ════════ RENDU ════════
  function input(f, path, v) {
    const id = "pf-" + path.replace(/\./g, "-"), base = `id="${id}" data-path="${esc(path)}" data-t="${f.t}"`;
    if (f.t === "textarea") return `<textarea ${base} rows="3" maxlength="${f.max || 2000}">${esc(v)}</textarea>`;
    if (f.t === "lines") return `<textarea ${base} rows="3">${esc((v || []).join("\n"))}</textarea>`;
    if (f.t === "tags") return `<input ${base} type="text" value="${esc((v || []).join(", "))}">`;
    if (f.t === "number") return `<input ${base} type="number" value="${esc(v ?? 0)}"${f.min != null ? ` min="${f.min}"` : ""}${f.max != null ? ` max="${f.max}"` : ""} inputmode="numeric">`;
    if (f.t === "select") return `<select ${base}>${f.o.map(([val, lab]) => `<option value="${esc(val)}"${val === v ? " selected" : ""}>${esc(lab)}</option>`).join("")}</select>`;
    if (f.t === "check") return `<label class="pf-check"><input ${base} type="checkbox"${v !== false ? " checked" : ""}> Oui</label>`;
    if (f.t === "photo") {
      const prev = get(D, "about.photoPreview") || (v && !/^https?:/.test(v) ? "../" + v : v);
      return `<div class="pf-photo"><img src="${esc(prev || "")}" alt="" id="pf-photo-img"><div class="stack"><input ${base} type="text" value="${esc(v)}" readonly>
        <label class="btn ghost sm" for="pf-photo-file">Choisir une nouvelle photo…</label><input type="file" id="pf-photo-file" accept="image/jpeg,image/png,image/webp" hidden>
        <small class="hint">Redimensionnée automatiquement (900 px max) et envoyée sur GitHub à la publication.</small></div></div>`;
    }
    return `<input ${base} type="${f.t === "url" ? "text" : f.t === "email" ? "email" : "text"}" value="${esc(v)}"${f.ph ? ` placeholder="${esc(f.ph)}"` : ""} maxlength="${f.max || 500}"${f.t === "url" ? ' inputmode="url" spellcheck="false"' : ""}>`;
  }
  function fieldHTML(f, path) {
    const v = get(D, path);
    if (f.t === "list") {
      const list = Array.isArray(v) ? v : [];
      return `<div class="pf-list wide" data-list-path="${esc(path)}"><div class="pf-list-head"><h3>${esc(f.l)} <em>${list.length}</em></h3><button class="btn sm" type="button" data-act="add" data-p="${esc(path)}"${list.length >= (f.max || 99) ? " disabled" : ""}>+ Ajouter</button></div>
        ${list.map((x, i) => `<details class="pf-item"${list.length <= 3 ? " open" : ""}><summary><span class="pf-num">${i + 1}</span><span class="pf-title">${esc(f.title(x))}</span>
          <span class="pf-tools"><button type="button" class="del" data-act="up" data-p="${esc(path)}" data-i="${i}" aria-label="Monter"${i ? "" : " disabled"}>↑</button><button type="button" class="del" data-act="down" data-p="${esc(path)}" data-i="${i}" aria-label="Descendre"${i < list.length - 1 ? "" : " disabled"}>↓</button><button type="button" class="del" data-act="dup" data-p="${esc(path)}" data-i="${i}" aria-label="Dupliquer">⧉</button><button type="button" class="del danger-x" data-act="del" data-p="${esc(path)}" data-i="${i}" aria-label="Supprimer">✕</button></span></summary>
          <div class="pf-grid">${f.scalar ? `<label class="field wide">Texte${input({ t: f.scalar }, `${path}.${i}`, x)}</label>` : f.item.map(it => `<label class="field${it.wide ? " wide" : ""}">${esc(it.l)}${input(it, `${path}.${i}.${it.k}`, x ? x[it.k] : "")}</label>`).join("")}</div></details>`).join("")}
        ${list.length ? "" : `<p class="empty">Aucun élément.</p>`}</div>`;
    }
    return `<label class="field${f.wide || f.t === "textarea" ? " wide" : ""}">${esc(f.l)}${input(f, path, get(D, path))}</label>`;
  }
  function render() {
    if (!D) { root.innerHTML = `<p class="empty">Le fichier content/portfolio.js est introuvable : impossible d'éditer le portfolio.</p>`; return; }
    const S = SECTIONS.find(s => s.id === section) || SECTIONS[0];
    $("#pf-nav").innerHTML = SECTIONS.map(s => `<button type="button" data-sec="${s.id}" class="${s.id === section ? "on" : ""}">${esc(s.label)}${s.id !== "publier" && PUB && !same(pick(D, s), pick(PUB, s)) ? ' <i class="dotmod" title="Modifié"></i>' : ""}</button>`).join("");
    if (S.id === "publier") return renderPublish();
    root.innerHTML = `<div class="pf-grid">${S.f.map(f => fieldHTML(f, f.p)).join("")}</div>`;
    status();
  }
  const pick = (o, s) => s.f.map(f => get(f.p === "about.photo" ? stripPreview(o) : o, f.p));

  function status() {
    const el = $("#pf-status"); if (!el) return;
    const d = dirty();
    el.className = "chip " + (d ? "pf-dirty" : "pf-clean");
    el.textContent = d ? "Brouillon modifié · pas encore publié" : "Identique au site publié";
    $("#pf-revert").disabled = !d; $("#pf-publish-top").disabled = !d;
    $$("#pf-nav [data-sec]").forEach(b => { const s = SECTIONS.find(x => x.id === b.dataset.sec); const m = s && s.id !== "publier" && PUB && !same(pick(D, s), pick(PUB, s)); const has = !!$(".dotmod", b); if (m && !has) b.insertAdjacentHTML("beforeend", ' <i class="dotmod" title="Modifié"></i>'); if (!m && has) $(".dotmod", b).remove(); });
  }

  // ════════ ÉVÉNEMENTS ════════
  root.addEventListener("input", e => {
    const t = e.target, p = t.dataset.path; if (!p) return;
    let v = t.type === "checkbox" ? t.checked : t.value;
    if (t.dataset.t === "number") { v = Number(v) || 0; if (t.max) v = Math.min(+t.max, v); if (t.min) v = Math.max(+t.min, v); }
    if (t.dataset.t === "tags") v = v.split(",").map(s => s.trim()).filter(Boolean);
    if (t.dataset.t === "lines") v = v.split("\n").map(s => s.trim()).filter(Boolean);
    set(D, p, v);
    const det = t.closest(".pf-item"); if (det) { const lp = det.closest("[data-list-path]").dataset.listPath, f = findField(lp), i = +p.slice(lp.length + 1).split(".")[0]; $(".pf-title", det).textContent = f.title(get(D, lp)[i]); }
    clearTimeout(root.t); root.t = setTimeout(saveDraft, 250);
  });
  root.addEventListener("change", e => { if (e.target.id === "pf-photo-file") loadPhoto(e.target.files[0]); });
  const findField = p => { for (const s of SECTIONS) for (const f of s.f) if (f.p === p) return f; };
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    e.preventDefault();
    const p = b.dataset.p, f = findField(p), list = get(D, p) || [], i = +b.dataset.i;
    if (b.dataset.act === "add") { list.push(f.neu()); set(D, p, list); }
    if (b.dataset.act === "del") { if (!confirm("Supprimer cet élément ?")) return; list.splice(i, 1); }
    if (b.dataset.act === "dup") list.splice(i + 1, 0, clone(list[i]));
    if (b.dataset.act === "up" && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    if (b.dataset.act === "down" && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    saveDraft(); render();
    if (b.dataset.act === "add") { const all = $$(`[data-list-path="${p}"] .pf-item`); const last = all[all.length - 1]; if (last) { last.open = true; last.scrollIntoView({ block: "center", behavior: "smooth" }); } }
  });
  $("#pf-nav").addEventListener("click", e => { const b = e.target.closest("[data-sec]"); if (b) { section = b.dataset.sec; render(); } });
  $("#pf-preview").addEventListener("click", () => { saveDraft(); window.open("../?apercu=1", "_blank", "noopener"); });
  $("#pf-revert").addEventListener("click", () => { if (!confirm("Annuler toutes les modifications non publiées ?")) return; D = clone(PUB); try { localStorage.removeItem(DRAFT); } catch (e) {} render(); toast("Modifications annulées."); });
  $("#pf-publish-top").addEventListener("click", () => { section = "publier"; render(); });

  // Photo : redimensionnée en JPEG ≤ 900 px avant envoi
  function loadPhoto(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return toast("Choisis une image JPEG, PNG ou WebP.");
    if (file.size > 15e6) return toast("Image trop lourde (15 Mo max).");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      const data = c.toDataURL("image/jpeg", 0.86);
      D.about.photo = `assets/images/photo-${Date.now().toString(36)}.jpg`; D.about.photoPreview = data;
      saveDraft(); render(); toast("Photo prête : elle sera envoyée à la publication.");
    };
    img.onerror = () => toast("Impossible de lire cette image.");
    img.src = url;
  }

  // ════════ PUBLICATION GITHUB ════════
  const token = () => sessionToken || (window.GMVault && GMVault.get()) || "";
  function renderPublish() {
    const d = dirty(), changed = SECTIONS.filter(s => s.id !== "publier" && PUB && !same(pick(D, s), pick(PUB, s))).map(s => s.label);
    const remembered = !!(window.GMVault && GMVault.get()), enc = !!(window.GMVault && GMVault.encrypted());
    root.innerHTML = `<div class="pf-grid">
      <div class="wide pf-box ${d ? "warn" : "ok"}"><b>${d ? `Modifications prêtes : ${esc(changed.join(", ") || "contenu")}` : "Aucune modification à publier."}</b>
        <span class="hint">À la publication, le fichier <code>${esc(conf.path)}</code> est mis à jour sur GitHub, puis Vercel remet le site en ligne (environ 1 minute).</span></div>
      <label class="field">Compte GitHub<input id="gh-owner" value="${esc(conf.owner)}" spellcheck="false"></label>
      <label class="field">Dépôt<input id="gh-repo" value="${esc(conf.repo)}" spellcheck="false"></label>
      <label class="field">Branche<input id="gh-branch" value="${esc(conf.branch)}" spellcheck="false"></label>
      <label class="field">Fichier de contenu<input id="gh-path" value="${esc(conf.path)}" spellcheck="false"></label>
      <label class="field wide">Jeton GitHub (fine-grained, accès « Contents : Read and write » à ce seul dépôt)
        <input id="gh-token" type="password" autocomplete="off" spellcheck="false" placeholder="${remembered ? "Jeton enregistré (chiffré) — laisse vide pour l'utiliser" : sessionToken ? "Jeton gardé pour cette session" : "github_pat_…"}"></label>
      <label class="pf-check wide"><input type="checkbox" id="gh-remember"${enc ? "" : " disabled"}${remembered ? " checked" : ""}> Retenir le jeton sur cet appareil ${enc ? "(stocké chiffré)" : "— active d'abord le chiffrement dans Réglages"}</label>
      <div class="wide pf-actions"><button class="btn ghost" type="button" id="gh-test">Tester la connexion</button><button class="btn" type="button" id="gh-publish"${d ? "" : " disabled"}>Publier sur le site</button>
        <button class="btn ghost" type="button" id="gh-export">Télécharger le contenu (.json)</button></div>
      <p class="hint wide" id="gh-msg"></p>
      <details class="wide pf-help"><summary>Créer le jeton GitHub (2 minutes)</summary><ol>
        <li>GitHub → Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token.</li>
        <li>Repository access : <b>Only select repositories</b> → ${esc(conf.repo)}.</li>
        <li>Permissions → Repository → <b>Contents : Read and write</b>. Rien d'autre.</li>
        <li>Expiration : 90 jours conseillés. Copie le jeton et colle-le ici.</li></ol>
        <p class="hint">Le jeton ne sert qu'à écrire dans ce dépôt. Il n'est jamais envoyé ailleurs qu'à api.github.com.</p></details>
      <div class="wide"><h3 class="pf-h3">Historique des publications</h3><ul class="journal">${(conf.history || []).slice(-8).reverse().map(h => `<li><span class="txt">${esc(h.date)} · ${esc(h.what)}</span>${/^https:\/\/github\.com\//.test(h.url || "") ? `<a class="k" href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">voir</a>` : ""}</li>`).join("") || '<li class="empty">Aucune publication depuis ce tableau de bord.</li>'}</ul></div>
    </div>`;
    status();
    ["owner", "repo", "branch", "path"].forEach(k => $("#gh-" + k).addEventListener("change", e => { conf[k] = e.target.value.trim(); saveConf(); }));
    $("#gh-token").addEventListener("change", e => { const v = e.target.value.trim(); if (v) { sessionToken = v; if ($("#gh-remember").checked && window.GMVault) GMVault.set(v); } });
    $("#gh-remember").addEventListener("change", e => { if (!window.GMVault) return; if (e.target.checked) { const v = $("#gh-token").value.trim() || sessionToken; if (v) { GMVault.set(v); toast("Jeton enregistré (chiffré)."); } else { e.target.checked = false; toast("Colle d'abord le jeton."); } } else { GMVault.set(""); toast("Jeton oublié sur cet appareil."); } });
    $("#gh-test").addEventListener("click", testConn);
    $("#gh-publish").addEventListener("click", publish);
    $("#gh-export").addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(stripPreview(D), null, 2)], { type: "application/json" })); a.download = "portfolio-contenu.json"; document.body.appendChild(a); a.click(); a.remove(); });
  }
  const msg = (t, k) => { const m = $("#gh-msg"); if (m) { m.textContent = t; m.className = "hint wide " + (k || ""); } };
  function validRepo() { return /^[\w.-]{1,100}$/.test(conf.owner) && /^[\w.-]{1,100}$/.test(conf.repo) && /^[\w./-]{1,100}$/.test(conf.branch) && /^[\w./-]{1,200}\.js$/.test(conf.path) && !conf.path.includes(".."); }
  async function gh(method, url, body) {
    const tk = token(); if (!tk) throw new Error("Colle ton jeton GitHub dans le champ « Jeton ».");
    const r = await fetch("https://api.github.com" + url, { method, headers: { Authorization: "Bearer " + tk, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", referrerPolicy: "no-referrer" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(r.status === 401 ? "Jeton refusé (invalide ou expiré)." : r.status === 403 ? "Jeton sans droit d'écriture sur ce dépôt." : r.status === 404 ? "Dépôt, branche ou fichier introuvable (ou jeton sans accès à ce dépôt)." : r.status === 409 ? "Conflit : le fichier a changé sur GitHub, réessaie." : j.message || "Erreur GitHub " + r.status); e.status = r.status; throw e; }
    return j;
  }
  const enc = s => { const b = new TextEncoder().encode(s); let out = ""; for (let i = 0; i < b.length; i += 0x8000) out += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(out); };
  const dec = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), c => c.charCodeAt(0)));
  const repoPath = p => `/repos/${encodeURIComponent(conf.owner)}/${encodeURIComponent(conf.repo)}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;
  async function testConn() {
    if (!validRepo()) return msg("Compte, dépôt, branche ou fichier invalide.", "negc");
    msg("Connexion à GitHub…");
    try {
      const r = await gh("GET", `/repos/${encodeURIComponent(conf.owner)}/${encodeURIComponent(conf.repo)}`);
      msg(r.permissions && r.permissions.push ? `Connexion réussie : tu peux publier sur ${r.full_name}.` : "Connexion réussie, mais ce jeton ne peut pas écrire dans le dépôt.", r.permissions && r.permissions.push ? "okc" : "negc");
    } catch (e) { msg(e.message, "negc"); }
  }
  function sanitize(o) {
    const c = stripPreview(o);
    (function walk(x) { for (const k in x) { if (typeof x[k] === "string") x[k] = x[k].slice(0, 2000); else if (x[k] && typeof x[k] === "object") walk(x[k]); } })(c);
    const bad = [];
    const okUrl = u => !u || /^(https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[+\d\s-]+|[\w\-./]+)$/i.test(u);
    (c.projects && c.projects.items || []).forEach(p => { if (!okUrl(p.url)) bad.push(`lien du projet « ${p.name} »`); });
    (c.contact && c.contact.links || []).forEach(l => { if (!okUrl(l.url)) bad.push(`lien « ${l.label || l.url} »`); });
    if (c.about && !okUrl(c.about.ctaUrl)) bad.push("lien de la page À propos");
    return { c, bad };
  }
  async function publish() {
    if (!validRepo()) return msg("Compte, dépôt, branche ou fichier invalide.", "negc");
    const { c, bad } = sanitize(D);
    if (bad.length) return msg("Liens invalides à corriger : " + bad.join(", ") + ". Utilise https://, mailto: ou tel:.", "negc");
    const btn = $("#gh-publish"); btn.disabled = true; msg("Publication en cours…");
    try {
      const cur = await gh("GET", repoPath(conf.path) + "?ref=" + encodeURIComponent(conf.branch));
      try {
        const remote = JSON.parse(dec(cur.content).replace(/^\s*window\.PORTFOLIO\s*=\s*/, "").replace(/;\s*$/, ""));
        if (PUB && !same(remote, PUB) && !confirm("Le contenu en ligne a été modifié ailleurs depuis l'ouverture de ce tableau de bord. Le remplacer quand même ?")) { btn.disabled = false; return msg("Publication annulée."); }
      } catch (e) {}
      if (D.about && D.about.photoPreview && c.about.photo && /^assets\/images\/photo-[\w]+\.jpg$/.test(c.about.photo)) {
        msg("Envoi de la photo…");
        await gh("PUT", repoPath(c.about.photo), { message: "Portfolio : nouvelle photo (tableau de bord)", content: D.about.photoPreview.split(",")[1], branch: conf.branch });
      }
      const file = "window.PORTFOLIO = " + JSON.stringify(c, null, 2) + ";\n";
      const res = await gh("PUT", repoPath(conf.path), { message: "Portfolio : mise à jour du contenu (tableau de bord)", content: enc(file), sha: cur.sha, branch: conf.branch });
      const changed = SECTIONS.filter(s => s.id !== "publier" && PUB && !same(pick(D, s), pick(PUB, s))).map(s => s.label).join(", ");
      PUB = clone(c); D = clone(c); try { localStorage.removeItem(DRAFT); } catch (e) {}
      conf.history = (conf.history || []).concat({ date: new Date().toLocaleString("fr-FR"), what: changed || "contenu", url: res.commit && res.commit.html_url }).slice(-30); saveConf();
      if (window.GMVault) GMVault.log("Portfolio publié : " + (changed || "contenu"));
      render(); msg("Publié ! Le site sera à jour dans environ 1 minute.", "okc"); toast("Portfolio publié.");
    } catch (e) { msg(e.message, "negc"); btn.disabled = false; }
  }

  render();
})();
