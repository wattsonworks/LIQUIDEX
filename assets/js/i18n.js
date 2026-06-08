/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX i18n — bilingual HE(default,RTL) / EN(LTR)           ║
   ║  Markup pattern:                                               ║
   ║    <h2 data-he="כותרת" data-en="Title"></h2>                  ║
   ║    <p data-he="…" data-en="…" data-html></p>  (allows tags)   ║
   ║    <input data-he-ph="…" data-en-ph="…">      (placeholder)   ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const KEY = "liquidex_lang";
  const DEFAULT = "he";
  const RTL = new Set(["he", "ar"]);

  function detect() {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    // URL ?lang= override (used by /en links etc.)
    const q = new URLSearchParams(location.search).get("lang");
    if (q) return q;
    return DEFAULT;
  }

  function apply(lang) {
    const dir = RTL.has(lang) ? "rtl" : "ltr";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);

    document.querySelectorAll("[data-he],[data-en]").forEach((el) => {
      const val = el.getAttribute("data-" + lang);
      if (val == null) return;
      if (el.hasAttribute("data-html")) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-he-ph],[data-en-ph]").forEach((el) => {
      const val = el.getAttribute("data-" + lang + "-ph");
      if (val != null) el.setAttribute("placeholder", val);
    });
    // toggle button label shows the OTHER language
    document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
      b.textContent = lang === "he" ? "EN" : "עב";
      b.setAttribute("aria-label", lang === "he" ? "Switch to English" : "החלף לעברית");
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, dir } }));
  }

  function setLang(lang) {
    localStorage.setItem(KEY, lang);
    apply(lang);
  }

  window.LIQ_I18N = {
    get current() { return document.documentElement.getAttribute("lang") || DEFAULT; },
    set: setLang,
    toggle() { setLang(this.current === "he" ? "en" : "he"); },
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
