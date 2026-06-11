/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX i18n — trilingual HE(default,RTL) / EN(LTR) / AR(RTL)║
   ║  Markup pattern:                                               ║
   ║    <h2 data-he="כותרת" data-en="Title"></h2>                  ║
   ║    <p data-he="…" data-en="…" data-html></p>  (allows tags)   ║
   ║    <input data-he-ph="…" data-en-ph="…">      (placeholder)   ║
   ║  Arabic comes from window.LIQ_AR (assets/js/lang-ar.js), keyed ║
   ║  by the Hebrew source string. An explicit data-ar=""/data-ar-ph║
   ║  on an element overrides the dictionary.                       ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const KEY = "liquidex_lang";
  const DEFAULT = "he";
  const ORDER = ["he", "en", "ar"];          // toggle cycle
  const LABEL = { he: "עב", en: "EN", ar: "ع" };
  const RTL = new Set(["he", "ar"]);

  function detect() {
    const saved = localStorage.getItem(KEY);
    if (saved && ORDER.includes(saved)) return saved;
    const q = new URLSearchParams(location.search).get("lang"); // ?lang= override
    if (q && ORDER.includes(q)) return q;
    return DEFAULT;
  }

  function arFor(el, heVal) {
    // explicit override first, then dictionary, then English, then Hebrew
    const own = el.getAttribute("data-ar");
    if (own != null) return own;
    const M = window.LIQ_AR;
    if (M && heVal != null && Object.prototype.hasOwnProperty.call(M, heVal)) return M[heVal];
    const en = el.getAttribute("data-en");
    return en != null ? en : heVal;
  }

  function apply(lang) {
    const dir = RTL.has(lang) ? "rtl" : "ltr";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);

    document.querySelectorAll("[data-he],[data-en]").forEach((el) => {
      let val;
      if (lang === "ar") val = arFor(el, el.getAttribute("data-he"));
      else val = el.getAttribute("data-" + lang);
      if (val == null) return;
      if (el.hasAttribute("data-html")) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-he-ph],[data-en-ph]").forEach((el) => {
      let val = el.getAttribute("data-" + lang + "-ph");
      if (val == null && lang === "ar") val = el.getAttribute("data-en-ph"); // AR placeholder falls back to EN
      if (val != null) el.setAttribute("placeholder", val);
    });
    // toggle button shows the NEXT language in the cycle
    const next = ORDER[(ORDER.indexOf(lang) + 1) % ORDER.length];
    document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
      b.textContent = LABEL[next];
      b.setAttribute("aria-label", "Switch language (HE · EN · AR)");
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, dir } }));
  }

  function setLang(lang) {
    if (!ORDER.includes(lang)) lang = DEFAULT;
    localStorage.setItem(KEY, lang);
    apply(lang);
  }

  window.LIQ_I18N = {
    get current() { return document.documentElement.getAttribute("lang") || DEFAULT; },
    set: setLang,
    cycle: ORDER,
    toggle() { setLang(ORDER[(ORDER.indexOf(this.current) + 1) % ORDER.length]); },
  };

  // apply ASAP (lang/dir already inlined in <html>, this fills text)
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => apply(detect()));
  else apply(detect());

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lang-toggle]");
    if (t) { e.preventDefault(); window.LIQ_I18N.toggle(); }
  });
})();
