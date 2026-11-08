/* Affiche le contenu de content/portfolio.js dans la page (avant les animations).
   Le contenu est modifiable depuis le tableau de bord (/dashboard/ → onglet Portfolio).
   Sécurité : tout le texte est inséré avec textContent ; les liens sont filtrés (http, https, mailto, tel, chemins relatifs).
   Si les données sont absentes ou invalides, la page garde son contenu d'origine. */
(function () {
  "use strict";
  var P = window.PORTFOLIO, preview = false;
  try {
    if (/[?&]apercu=1\b/.test(location.search)) {
      var d = JSON.parse(localStorage.getItem("gm-portfolio-draft") || "null");
      if (d && d.version === 1) { P = d; preview = true; }
    }
  } catch (e) {}
  if (!P || P.version !== 1) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var str = function (v) { return v == null ? "" : String(v); };
  var arr = function (v) { return Array.isArray(v) ? v : []; };
  function safeUrl(u) {
    u = str(u).trim();
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z0-9_\-./#?=&%]+$/i.test(u) && !/^\/\//.test(u) && !/:/.test(u)) return u;
    return "#";
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = str(text); return e; }
  function svg(markup) { var t = document.createElement("template"); t.innerHTML = markup; return t.content.firstChild; } // icônes fixes ci-dessous uniquement
  var S = ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    phone: '<svg' + S + '><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17v-.08z"/></svg>',
    mail: '<svg' + S + '><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    github: '<svg' + S + '><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    tiktok: '<svg' + S + '><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
    web: '<svg' + S + '><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    linkedin: '<svg' + S + '><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    whatsapp: '<svg' + S + '><path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.3-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    location: '<svg' + S + '><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    arrow: '<svg' + S + '><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    diag: '<svg' + S + '><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>'
  };
  var icon = function (t) { return svg(ICON[t] || ICON.web); };
  function setLabel(a, label) { // remplace le texte d'un bouton en gardant son icône
    if (!a) return;
    Array.prototype.slice.call(a.childNodes).forEach(function (n) { if (n.nodeType === 3) a.removeChild(n); });
    a.appendChild(document.createTextNode(str(label)));
  }
  function richText(p, s) { // **gras** uniquement
    str(s).split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (/^\*\*[^*]+\*\*$/.test(part)) p.appendChild(el("strong", null, part.slice(2, -2)));
      else if (part) p.appendChild(document.createTextNode(part));
    });
  }
  function run(name, fn) { try { fn(); } catch (e) { if (window.console) console.warn("Portfolio : section « " + name + " » non appliquée", e); } }
  var B = P.brand || {}, H = P.hero || {}, C = P.contact || {}, A = P.about || {}, V = P.cv || {}, W = P.projects || {};
  var links = arr(C.links).filter(function (l) { return l && l.url; });

  run("meta", function () {
    var M = P.meta || {};
    if (M.title) document.title = str(M.title);
    if (M.description) {
      var m = $('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.content = str(M.description);
    }
  });

  run("marque", function () {
    var logo = $(".nav-logo");
    if (logo) { $(".logo-mark", logo).textContent = str(B.logo || "GM"); setLabel(logo, B.name); }
    var pre = $(".pre-logo-inner");
    if (pre && (B.preloader1 || B.preloaderEm || B.preloader2)) {
      pre.textContent = ""; pre.appendChild(document.createTextNode(str(B.preloader1) + " "));
      pre.appendChild(el("em", null, B.preloaderEm)); pre.appendChild(document.createTextNode(" " + str(B.preloader2)));
    }
    if (B.preloaderSub) $(".pre-sub").textContent = str(B.preloaderSub);
    var ms = $(".menu-socials");
    if (ms && links.length) {
      ms.textContent = "";
      links.filter(function (l) { return l.menu; }).forEach(function (l) {
        var a = el("a"); a.href = safeUrl(l.url); a.target = "_blank"; a.rel = "noopener";
        a.appendChild(icon(l.type)); a.appendChild(document.createTextNode(str(l.menu))); ms.appendChild(a);
      });
    }
  });

  run("accueil", function () {
    var tag = $(".home-tag");
    if (tag && H.tag) { Array.prototype.slice.call(tag.childNodes).forEach(function (n) { if (n.nodeType === 3) tag.removeChild(n); }); tag.insertBefore(document.createTextNode(str(H.tag)), tag.lastElementChild); }
    var h1 = $("#heroH1");
    if (h1 && H.name) {
      h1.textContent = "";
      h1.appendChild(document.createTextNode(str(H.intro) + " "));
      var hn = el("span", "hn"); hn.id = "hoverName"; hn.appendChild(el("em", null, H.name)); h1.appendChild(hn);
      h1.appendChild(el("br")); h1.appendChild(document.createTextNode(str(H.line2))); h1.appendChild(el("br"));
      h1.appendChild(document.createTextNode(str(H.aliasIntro) + " "));
      var ha = el("span", "ha", str(H.alias).replace(/ /g, " ")); ha.id = "hoverAlias"; h1.appendChild(ha);
    }
    var sub = $("#homeSub");
    if (sub) { sub.textContent = ""; sub.appendChild(document.createTextNode(str(H.sub1))); if (H.sub2) { sub.appendChild(el("br")); sub.appendChild(document.createTextNode(str(H.sub2))); } }
    var btns = $$("#homeBtns .hbtn");
    [H.btnProjects, H.btnCV, H.btnContact].forEach(function (l, i) { if (l && btns[i]) setLabel(btns[i], l); });
  });

  run("chiffres", function () {
    var st = arr(P.stats).filter(function (s) { return s && s.label; });
    if (!st.length) return;
    var hs = $("#homeStats"), as = $(".about-stats");
    if (hs) { hs.textContent = ""; st.forEach(function (s) { var d = el("div"), n = el("div", "hstat-num", "0"); n.dataset.target = Math.max(0, parseInt(s.value, 10) || 0); n.dataset.suffix = str(s.suffix); d.appendChild(n); d.appendChild(el("div", "hstat-lbl", s.label)); hs.appendChild(d); }); }
    if (as) { as.textContent = ""; st.forEach(function (s) { var d = el("div", "a-stat"); d.appendChild(el("div", "a-num", str(s.value) + str(s.suffix))); d.appendChild(el("div", "a-lbl", s.label)); as.appendChild(d); }); }
  });

  run("projets", function () {
    var page = $("#page-work"); if (!page) return;
    if (W.title) $(".page-title", page).textContent = str(W.title);
    if (W.subtitle != null) $(".page-sub", page).textContent = str(W.subtitle);
    var list = $(".work-list", page), items = arr(W.items).filter(function (p) { return p && p.name && p.visible !== false; });
    if (!list || !items.length) return;
    list.textContent = "";
    items.forEach(function (p, i) {
      var a = el("a", "work-item"); a.href = safeUrl(p.url || "#"); a.target = "_blank"; a.rel = "noopener";
      a.dataset.color = /^\d{1,3},\d{1,3},\d{1,3}$/.test(str(p.color)) ? p.color : "76,255,160";
      var l = el("div", "wi-l"); l.appendChild(el("span", "wi-num", p.num || String(i + 1).padStart(2, "0"))); l.appendChild(el("span", "wi-name", p.name));
      var r = el("div", "wi-r"); r.appendChild(el("span", "wi-cat", p.category));
      var stack = el("div", "wi-stack"); arr(p.tags).forEach(function (t) { if (t) stack.appendChild(el("span", "wi-tag", t)); }); r.appendChild(stack);
      var ar = el("span", "wi-arr"); ar.appendChild(icon("diag")); r.appendChild(ar);
      a.appendChild(l); a.appendChild(r); list.appendChild(a);
    });
  });

  run("à propos", function () {
    var page = $("#page-about"); if (!page) return;
    if (A.title) $(".page-title", page).textContent = str(A.title);
    var paras = arr(A.paragraphs).filter(Boolean), cta = $(".about-cta", page);
    if (paras.length && cta) {
      $$(".about-text", page).forEach(function (p) { p.remove(); });
      paras.forEach(function (t) { var p = el("p", "about-text"); richText(p, t); cta.parentNode.insertBefore(p, cta); });
    }
    if (cta) { if (A.ctaLabel) setLabel(cta, A.ctaLabel); if (A.ctaUrl) cta.href = safeUrl(A.ctaUrl); }
    var img = $(".photo-frame img", page);
    if (img && A.photo) {
      // en aperçu, une photo pas encore publiée est fournie en data:image (brouillon local)
      img.src = preview && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(str(A.photoPreview)) ? A.photoPreview : safeUrl(A.photo);
      img.alt = str(A.photoAlt);
    }
    var tp = $(".spin-label textPath", page); if (tp && A.spinText) tp.textContent = str(A.spinText);
    var sk = arr(A.skills).filter(function (s) { return s && s.name; }), box = $("#skillBars");
    if (box && sk.length) {
      box.textContent = "";
      sk.forEach(function (s) {
        var lv = Math.max(0, Math.min(100, parseInt(s.level, 10) || 0));
        var row = el("div", "sk-row"), top = el("div", "sk-top"); top.appendChild(el("span", "sk-n", s.name)); top.appendChild(el("span", "sk-p", lv + "%"));
        var bar = el("div", "sk-bar"), fill = el("div", "sk-fill"); fill.dataset.w = lv; bar.appendChild(fill);
        row.appendChild(top); row.appendChild(bar); box.appendChild(row);
      });
    }
  });

  function cvEntry(e) {
    var d = el("div", "cv-entry");
    d.appendChild(el("div", "cv-et", e.title));
    if (e.date) d.appendChild(el("div", "cv-ed", e.date));
    if (e.subtitle) d.appendChild(el("div", "cv-es", e.subtitle));
    var b = arr(e.bullets).filter(Boolean);
    if (b.length) { var bb = el("div", "cv-bullets"); b.forEach(function (x) { bb.appendChild(el("div", "cv-b", x)); }); d.appendChild(bb); }
    var t = arr(e.tags).filter(Boolean);
    if (t.length) { var tt = el("div", "cv-stags"); t.forEach(function (x) { tt.appendChild(el("span", "cv-stag", x)); }); d.appendChild(tt); }
    return d;
  }
  function cvContacts() {
    var out = [];
    if (C.cvLocation || C.location) out.push({ t: "location", label: C.cvLocation || C.location });
    if (C.phone) out.push({ t: "phone", label: C.phone });
    if (C.email) out.push({ t: "mail", label: C.email, url: "mailto:" + C.email });
    links.forEach(function (l) { if (l.cvLabel) out.push({ t: l.type, label: l.cvLabel, url: l.url }); });
    return out;
  }

  run("cv", function () {
    var page = $("#page-cv"); if (!page) return;
    if (V.title) $(".page-title", page).textContent = str(V.title);
    var dl = $(".dl-btn", page);
    if (dl) { if (V.downloadLabel) setLabel(dl, V.downloadLabel); dl.removeAttribute("onclick"); dl.addEventListener("click", downloadCV); }
    var nm = $(".cv-bigname", page), lines = arr(V.nameLines).filter(Boolean);
    if (nm && lines.length) { nm.textContent = ""; lines.forEach(function (l, i) { if (i) nm.appendChild(el("br")); nm.appendChild(document.createTextNode(str(l))); }); }
    if (V.role) $(".cv-role", page).textContent = str(V.role);
    if (V.summary) $(".cv-summary", page).textContent = str(V.summary);
    var main = $(".cv-main", page);
    if (main && (arr(V.experience).length || arr(V.education).length)) {
      main.textContent = "";
      main.appendChild(el("div", "cv-st", V.experienceTitle || "Expérience & Projets"));
      arr(V.experience).filter(function (e) { return e && e.title; }).forEach(function (e) { main.appendChild(cvEntry(e)); });
      if (arr(V.education).length) {
        main.appendChild(el("div", "cv-st", V.educationTitle || "Formation"));
        arr(V.education).filter(function (e) { return e && e.title; }).forEach(function (e) { main.appendChild(cvEntry(e)); });
      }
    }
    var side = $(".cv-sidebar", page);
    if (side) {
      side.textContent = "";
      var st = el("div", "cv-st", "Contact"); st.style.marginTop = "0"; side.appendChild(st);
      cvContacts().forEach(function (c) {
        var d = el("div", "cv-si"); d.appendChild(icon(c.t));
        if (c.url) { var a = el("a", null, c.label); a.href = safeUrl(c.url); if (/^https?:/.test(c.url)) { a.target = "_blank"; a.rel = "noopener"; } d.appendChild(a); }
        else d.appendChild(document.createTextNode(str(c.label)));
        side.appendChild(d);
      });
      var sk = arr(V.skills).filter(function (s) { return s && s.name; });
      if (sk.length) {
        side.appendChild(el("div", "cv-st", "Compétences"));
        sk.forEach(function (s) {
          var lv = Math.max(0, Math.min(100, parseInt(s.level, 10) || 0));
          var r = el("div", "cv-sk-r"), t = el("div", "cv-sk-t"); t.appendChild(el("span", "cv-sk-n", s.name)); t.appendChild(el("span", "cv-sk-p", lv + "%"));
          var tr = el("div", "cv-sk-track"), f = el("div", "cv-sk-fill"); f.style.width = lv + "%"; tr.appendChild(f); r.appendChild(t); r.appendChild(tr); side.appendChild(r);
        });
      }
      function tags(title, list) { list = arr(list).filter(Boolean); if (!list.length) return; side.appendChild(el("div", "cv-st", title)); var w = el("div", "cv-tags"); list.forEach(function (x) { w.appendChild(el("span", "cv-tag", x)); }); side.appendChild(w); }
      tags("Stack", V.stack);
      var lg = arr(V.languages).filter(Boolean);
      if (lg.length) { side.appendChild(el("div", "cv-st", "Langues")); lg.forEach(function (l) { var d = el("div", "cv-si"); d.appendChild(icon("web")); d.appendChild(document.createTextNode(str(l))); side.appendChild(d); }); }
      tags("Intérêts", V.interests);
    }
  });

  run("contact", function () {
    var page = $("#page-contact"); if (!page) return;
    var big = $(".contact-big", page);
    if (big && (C.big1 || C.big2)) { big.textContent = ""; big.appendChild(document.createTextNode(str(C.big1))); if (C.bigEm) big.appendChild(el("em", null, C.bigEm)); big.appendChild(el("br")); big.appendChild(document.createTextNode(str(C.big2))); }
    if (C.note) $(".contact-note", page).textContent = str(C.note);
    var box = $(".c-links", page); if (!box) return;
    box.textContent = "";
    function add(type, label, url) {
      var a = el(url ? "a" : "div", "c-lnk"); if (url) { a.href = safeUrl(url); if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; } }
      var l = el("div", "c-lnk-l"), ic = el("span", "c-ico"); ic.appendChild(icon(type)); l.appendChild(ic); l.appendChild(el("span", "c-lbl", label)); a.appendChild(l);
      if (url) { var ar = el("span", "c-arr"); ar.appendChild(icon("arrow")); a.appendChild(ar); }
      box.appendChild(a);
    }
    if (C.phone) add("phone", C.phone, "tel:" + str(C.phone).replace(/[^\d+]/g, ""));
    if (C.email) add("mail", C.email, "mailto:" + C.email);
    links.forEach(function (l) { add(l.type, l.label || l.url, l.url); });
    if (C.location) add("location", C.location, null);
  });

  // CV A4 téléchargeable, généré à partir des mêmes données (toujours à jour)
  function esc(s) { return str(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function downloadCV(ev) {
    if (ev) ev.preventDefault();
    var en = function (e) {
      return '<div class="en"><div class="et">' + esc(e.title) + "</div>" + (e.date ? '<div class="ed">' + esc(e.date) + "</div>" : "") + (e.subtitle ? '<div class="es">' + esc(e.subtitle) + "</div>" : "") +
        (arr(e.bullets).filter(Boolean).length ? '<div class="eb">' + arr(e.bullets).filter(Boolean).map(function (b) { return '<div class="ebi">' + esc(b) + "</div>"; }).join("") + "</div>" : "") +
        (arr(e.tags).filter(Boolean).length ? '<div class="etags">' + arr(e.tags).filter(Boolean).map(function (t) { return '<span class="etag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") + "</div>";
    };
    var si = cvContacts().map(function (c) { return '<div class="si">' + (c.url && /^(https?:|mailto:)/.test(c.url) ? '<a href="' + esc(safeUrl(c.url)) + '">' + esc(c.label) + "</a>" : esc(c.label)) + "</div>"; }).join("");
    var sk = arr(V.skills).filter(function (s) { return s && s.name; }).map(function (s) { var lv = Math.max(0, Math.min(100, parseInt(s.level, 10) || 0)); return '<div class="skr"><div class="skt"><span class="skn">' + esc(s.name) + '</span><span class="skp">' + lv + '%</span></div><div class="skt2"><div class="skf" style="width:' + lv + '%"></div></div></div>'; }).join("");
    var tg = function (l, cls) { return '<div class="tags">' + arr(l).filter(Boolean).map(function (t) { return '<span class="' + cls + '">' + esc(t) + "</span>"; }).join("") + "</div>"; };
    var html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CV — ' + esc(B.name || "") + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>' +
      "@page{margin:0;size:A4}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',sans-serif;background:#f2f2f8;color:#1a1a4a;font-size:9.5pt;position:relative;min-height:297mm;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".blob-tr{position:absolute;top:-50px;right:-30px;width:260px;height:300px;border-radius:60% 40% 30% 70%/60% 30% 70% 40%;background:linear-gradient(135deg,#ffb3d1,#9b8ec4);opacity:.75}" +
      ".blob-br{position:absolute;bottom:-70px;right:-20px;width:210px;height:250px;border-radius:40% 60% 70% 30%/40% 50% 60% 50%;background:linear-gradient(135deg,#2d3a8c,#6b7fd4);opacity:.8}" +
      ".blob-bl{position:absolute;bottom:-50px;left:20px;width:190px;height:170px;border-radius:70% 30% 50% 50%/40% 60% 40% 60%;background:linear-gradient(135deg,#2d3a8c,#4a5aaa);opacity:.7}" +
      ".c{position:relative;z-index:1;padding:30pt 34pt 24pt}.name{font-weight:900;font-size:40pt;line-height:.9;letter-spacing:-.04em}.role{font-weight:900;font-size:13pt;text-transform:uppercase;margin-top:7pt}" +
      ".summary{font-size:8.5pt;color:#3a3a7a;line-height:1.7;margin-top:9pt;max-width:420pt}.grid{display:grid;grid-template-columns:1fr 140pt;gap:22pt;margin-top:16pt}" +
      ".st{font-weight:900;font-size:8.5pt;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7pt;margin-top:13pt;display:flex;align-items:center;gap:5pt}.st::before{content:'';width:14pt;height:2pt;background:#4cffa0}.st:first-child{margin-top:0}" +
      ".en{margin-bottom:9pt}.et{font-weight:800;font-size:9pt}.ed{font-size:6.5pt;color:#3d9970;font-weight:700;letter-spacing:.08em;margin:.7pt 0}.es{font-size:7.5pt;color:#5555a0;font-style:italic;margin-bottom:2.5pt}" +
      ".eb{font-size:7.5pt;color:#3a3a7a;line-height:1.5}.ebi{margin-bottom:1.5pt;display:flex;gap:5pt}.ebi::before{content:'•';color:#4cffa0}.etags{display:flex;flex-wrap:wrap;gap:2.5pt;margin-top:3.5pt}" +
      ".etag{font-size:5.5pt;background:rgba(42,42,90,.07);border:.5pt solid rgba(42,42,90,.18);color:#3a3a7a;padding:1.2pt 4pt;border-radius:2.5pt}.si{font-size:7.5pt;color:#3a3a7a;margin-bottom:4.5pt;line-height:1.45}.si a{color:#2d3a8c;text-decoration:none}" +
      ".skr{margin-bottom:5.5pt}.skt{display:flex;justify-content:space-between;font-size:7.5pt;margin-bottom:2pt}.skn{font-weight:700}.skp{color:#3d9970;font-size:6.5pt}.skt2{height:2.5pt;background:rgba(42,42,90,.1);border-radius:2pt}.skf{height:100%;background:linear-gradient(90deg,#4cffa0,#6b9fff);border-radius:2pt}" +
      ".tags{display:flex;flex-wrap:wrap;gap:2.5pt}.tag{font-size:6pt;color:#2d3a8c;background:rgba(45,58,140,.09);padding:1.5pt 4.5pt;border-radius:2.5pt;font-weight:600}</style></head><body>" +
      '<div class="blob-tr"></div><div class="blob-br"></div><div class="blob-bl"></div><div class="c">' +
      '<div class="name">' + arr(V.nameLines).map(esc).join("<br>") + '</div><div class="role">' + esc(V.role) + '</div><div class="summary">' + esc(V.summary) + "</div>" +
      '<div class="grid"><div><div class="st">' + esc(V.experienceTitle || "Expérience & Projets") + "</div>" + arr(V.experience).filter(function (e) { return e && e.title; }).map(en).join("") +
      (arr(V.education).length ? '<div class="st">' + esc(V.educationTitle || "Formation") + "</div>" + arr(V.education).filter(function (e) { return e && e.title; }).map(en).join("") : "") +
      '</div><div><div class="st">Contact</div>' + si + (sk ? '<div class="st">Compétences</div>' + sk : "") +
      (arr(V.stack).length ? '<div class="st">Stack</div>' + tg(V.stack, "tag") : "") +
      (arr(V.languages).length ? '<div class="st">Langues</div>' + arr(V.languages).map(function (l) { return '<div class="si">' + esc(l) + "</div>"; }).join("") : "") +
      "</div></div></div></body></html>";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new window.Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = "CV_" + str(arr(V.nameLines).join("_") || "portfolio").replace(/[^\wÀ-ÿ-]+/g, "_") + ".html";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  if (preview) {
    var bn = el("div", null, "Aperçu du brouillon — pas encore publié");
    bn.setAttribute("style", "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9500;background:#ff2255;color:#fff;font:600 13px Outfit,sans-serif;padding:8px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);pointer-events:none");
    document.body.appendChild(bn);
  }
})();
