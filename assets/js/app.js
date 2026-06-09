/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX — app interactions                                  ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const t = (he, en) => (window.LIQ_I18N?.current === "en" ? en : he);

  /* ── Reveal on scroll ──────────────────────────────────────── */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
    : null;
  function bindReveals() {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io ? io.observe(el) : el.classList.add("in"));
  }

  /* ── Copy to clipboard ─────────────────────────────────────── */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const text = btn.getAttribute("data-copy");
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    const prev = btn.textContent;
    btn.textContent = t("✓ הועתק", "✓ Copied");
    setTimeout(() => (btn.textContent = prev), 1600);
  });

  /* ── Year stamp ────────────────────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── Checkout: render payment methods from config ──────────── */
  function money(usd) {
    const c = window.LIQUIDEX_CONFIG;
    return `${c.currencySymbol}${usd.toFixed(0)}`;
  }
  function withVat(usd) { return usd * (1 + window.LIQUIDEX_CONFIG.vatRate); }

  function qr(data) {
    const enc = encodeURIComponent(data);
    return `<img class="qr" alt="QR" loading="lazy"
      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${enc}"
      onerror="this.style.display='none'">`;
  }

  function renderCheckout() {
    const host = document.getElementById("pay-app");
    if (!host || !window.LIQUIDEX_CONFIG) return;
    const c = window.LIQUIDEX_CONFIG;
    const P = c.payments;
    const base = c.priceUSD;

    const methods = [
      P.isracart?.enabled && { id: "isracart", ico: "💳", nm: t("כרטיס אשראי", "Credit / Debit Card"), sub: "IsraCart", soon: P.isracart.status === "coming-soon", vat: P.isracart.vat },
      P.bit?.enabled && { id: "bit", ico: "📲", nm: "Bit", sub: t("העברה מיידית", "Instant transfer"), vat: P.bit.vat },
      P.crypto?.enabled && { id: "crypto", ico: "₿", nm: t("מטבע קריפטו", "Crypto"), sub: "USDT · USDC", vat: P.crypto.vat },
      P.bank?.enabled && { id: "bank", ico: "🏦", nm: t("העברה בנקאית", "Bank Transfer"), sub: t("מקומי / בינ״ל", "Local / Intl."), vat: P.bank.vat },
      P.cash?.enabled && { id: "cash", ico: "💵", nm: t("מזומן", "Cash"), sub: t("בתיאום", "By arrangement"), vat: P.cash.vat },
    ].filter(Boolean);

    const tabs = methods.map((m, i) => `
      <button class="pay-method${i === 0 ? " active" : ""}" data-pm="${m.id}">
        ${m.soon ? `<span class="soon">${t("בקרוב", "SOON")}</span>` : ""}
        <div class="ico">${m.ico}</div><div class="nm">${m.nm}</div><div class="sub">${m.sub}</div>
      </button>`).join("");

    const panels = methods.map((m, i) => `
      <div class="pay-panel" data-panel="${m.id}" ${i === 0 ? "" : "hidden"}>
        ${buildPanel(m.id, m, base, c)}
      </div>`).join("");

    host.innerHTML = `<div class="pay-grid">${tabs}</div>${panels}`;

    host.querySelectorAll("[data-pm]").forEach((b) => b.addEventListener("click", () => {
      host.querySelectorAll(".pay-method").forEach((x) => x.classList.toggle("active", x === b));
      const id = b.getAttribute("data-pm");
      host.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.getAttribute("data-panel") !== id));
    }));
  }

  function priceLine(vat, base) {
    if (!vat) return `<div class="detail-row"><span>${t("לתשלום החודש", "Due today")}</span><span>${money(base)} / ${t("חודש", "mo")}</span></div>`;
    return `<div class="detail-row"><span>${t("מנוי", "Subscription")}</span><span>${money(base)}</span></div>
            <div class="detail-row"><span>${t("מע״מ 18%", "VAT 18%")}</span><span>${money(base * 0.18)}</span></div>
            <div class="detail-row"><span><b>${t("סה״כ", "Total")}</b></span><span><b>${money(withVat(base))} / ${t("חודש", "mo")}</b></span></div>`;
  }

  function waLink(msg) {
    const wa = (window.LIQUIDEX_CONFIG?.whatsapp || "").replace(/[^0-9]/g, "");
    return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : "";
  }
  function mailLink(subj, msg) {
    const e = window.LIQUIDEX_CONFIG?.contactEmail || "";
    return (e && !/FILL ME/i.test(e)) ? `mailto:${e}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}` : "";
  }
  // Two-option username send: Email + WhatsApp (+ small copy fallback)
  function usernameSend(msgHe, msgEn, subjHe, subjEn) {
    const he = window.LIQ_I18N?.current === "he";
    const msg = he ? msgHe : msgEn, subj = he ? subjHe : subjEn;
    const ml = mailLink(subj, msg), wl = waLink(msg);
    let h = `<div class="send-actions">`;
    if (ml) h += `<a class="btn btn-primary" href="${ml}">✉&nbsp; ${t("שליחה במייל", "Send by email")}</a>`;
    if (wl) h += `<a class="btn btn-wa" href="${wl}" target="_blank" rel="noopener">${t("שליחה ב-WhatsApp", "Send on WhatsApp")}</a>`;
    h += `<button class="btn btn-outline btn-sm" data-copy="${msg.replace(/"/g, "&quot;")}">${t("העתקה", "Copy")}</button></div>`;
    if (!ml && !wl) h += `<p style="font-size:12.5px;color:var(--muted-2);margin-top:8px">${t("הגדירו אימייל / וואטסאפ ב-config.js", "Set email / WhatsApp in config.js")}</p>`;
    return h;
  }
  function accessBlock(c) {
    const msgHe = "שלום, שילמתי על מנוי LIQUIDEX. שם המשתמש שלי ב-TradingView: ______";
    const msgEn = "Hi, I paid for a LIQUIDEX membership. My TradingView username is: ______";
    return `<p style="color:var(--muted);font-size:14px;margin-top:16px">
      ${t("לאחר התשלום, שלחו את שם המשתמש שלכם ב-TradingView באחת משתי הדרכים — וקבלו גישת Invite-Only תוך 24 שעות:",
           "After payment, send your TradingView username one of two ways — invite-only access within 24h:")}</p>
      ${usernameSend(msgHe, msgEn, "LIQUIDEX access", "LIQUIDEX access")}`;
  }

  function buildPanel(id, m, base, c) {
    const P = c.payments;
    if (id === "isracart") {
      const live = P.isracart.status === "live" && P.isracart.checkoutUrl;
      return `<h4>${t("תשלום מאובטח בכרטיס אשראי", "Secure card payment")}</h4>
        <p style="color:var(--muted);font-size:14.5px">${t("Visa · Mastercard · American Express · Isracard", "Visa · Mastercard · American Express · Isracard")}</p>
        ${priceLine(m.vat, base)}
        ${live
          ? `<a class="btn btn-primary btn-block mt-2" href="${P.isracart.checkoutUrl}">${t("המשך לתשלום מאובטח ↗", "Continue to secure checkout ↗")}</a>`
          : `<div class="copy-row" style="color:var(--amber);border-color:rgba(255,184,0,.4)">${t("סליקת האשראי מופעלת בימים אלו — בחרו Bit / קריפטו / העברה בינתיים, או השאירו פרטים ונחזור אליכם.", "Card processing is being activated — use Bit / crypto / transfer meanwhile, or leave your details and we'll reach out.")}</div>`}
        ${accessBlock(c)}`;
    }
    if (id === "crypto") {
      const nets = (P.crypto.networks || []).map((n) => `
        <div style="border:1px solid var(--line);border-radius:10px;padding:14px;margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b>${n.coin}</b><span class="chip cyan">${n.chain}</span>
          </div>
          <div class="copy-row"><span>${n.address}</span><button data-copy="${n.address}">${t("העתק", "Copy")}</button></div>
          ${qr(n.address)}
        </div>`).join("");
      return `<h4>${t("תשלום בקריפטו", "Pay with crypto")}</h4>
        ${priceLine(m.vat, base)}
        <p style="color:var(--muted);font-size:13.5px;margin-top:8px">${t("שלחו את הסכום המדויק לאחת הכתובות, ואז שלחו צילום עסקה + שם משתמש TradingView.", "Send the exact amount to one of the addresses, then send the tx screenshot + your TradingView username.")}</p>
        ${nets}
        ${accessBlock(c)}`;
    }
    if (id === "bit") {
      return `<h4>Bit</h4>${priceLine(m.vat, base)}
        <div class="detail-row"><span>${t("מספר Bit", "Bit number")}</span><span>${P.bit.phone}</span></div>
        <div class="detail-row"><span>${t("על שם", "Name")}</span><span>${P.bit.name}</span></div>
        <div class="copy-row"><span>${P.bit.phone}</span><button data-copy="${P.bit.phone}">${t("העתק", "Copy")}</button></div>
        ${accessBlock(c)}`;
    }
    if (id === "bank") {
      const b = P.bank;
      const rows = [
        [t("בנק", "Bank"), b.bankName], [t("סניף", "Branch"), b.branch],
        [t("חשבון", "Account"), b.account], [t("מוטב", "Beneficiary"), b.beneficiary],
        ["IBAN", b.iban], ["SWIFT", b.swift],
      ].map(([k, v]) => `<div class="detail-row"><span>${k}</span><span>${v}</span></div>`).join("");
      return `<h4>${t("העברה בנקאית", "Bank transfer")}</h4>${priceLine(m.vat, base)}${rows}${accessBlock(c)}`;
    }
    if (id === "cash") {
      return `<h4>${t("מזומן", "Cash")}</h4>${priceLine(m.vat, base)}
        <p style="color:var(--muted)">${t(P.cash.note.he, P.cash.note.en)}</p>${accessBlock(c)}`;
    }
    return "";
  }

  /* ── Free trial widget (username-only activation) ──────────── */
  function buildTrialMsg(user, days) {
    return window.LIQ_I18N?.current === "he"
      ? `שלום, אני רוצה להפעיל ניסיון חינם של ${days} ימים ל-LIQUIDEX. שם המשתמש שלי ב-TradingView: ${user}`
      : `Hi, I'd like to activate a free ${days}-day LIQUIDEX trial. My TradingView username is: ${user}`;
  }
  function renderTrial() {
    const hosts = document.querySelectorAll("[data-trial-form]");
    if (!hosts.length || !window.LIQUIDEX_CONFIG) return;
    const c = window.LIQUIDEX_CONFIG;
    if (c.trialEnabled === false) { hosts.forEach((h) => (h.hidden = true)); return; }
    const days = c.trialDays || 7;
    hosts.forEach((host) => {
      host.innerHTML = `
        <span class="tag">${t("🎁 " + days + " ימים חינם", "🎁 " + days + " days free")}</span>
        <h3>${t("נסו שבוע על חשבוננו", "Try a week on us")}</h3>
        <p class="trial-sub">${t("רק שם המשתמש שלכם ב-TradingView. ללא כרטיס אשראי, ללא התחייבות.", "Just your TradingView username. No card, no commitment.")}</p>
        <div class="trial-row">
          <input class="trial-input" autocomplete="off" spellcheck="false"
            placeholder="${t("שם משתמש ב-TradingView", "TradingView username")}">
          <button class="btn btn-primary" data-trial-go>${t("הפעילו שבוע חינם", "Activate free week")}</button>
        </div>
        <div data-trial-out></div>
        <small class="trial-note">${t("גישת Invite-Only ל-" + days + " ימים תוך 24 שעות.", "Invite-only access for " + days + " days within 24h.")}</small>`;
      const input = host.querySelector(".trial-input");
      const out = host.querySelector("[data-trial-out]");
      host.querySelector("[data-trial-go]").addEventListener("click", () => {
        const u = (input.value || "").trim().replace(/^@/, "");
        if (!u) { input.classList.add("err"); input.focus(); return; }
        input.classList.remove("err");
        const mHe = `שלום, אני רוצה להפעיל ניסיון חינם של ${days} ימים ל-LIQUIDEX. שם המשתמש שלי ב-TradingView: ${u}`;
        const mEn = `Hi, I'd like to activate a free ${days}-day LIQUIDEX trial. My TradingView username is: ${u}`;
        out.innerHTML = usernameSend(mHe, mEn, "LIQUIDEX — free trial", "LIQUIDEX — free trial") +
          `<p class="g trial-ok" style="margin-top:10px">${t("שלחו לנו את ההודעה (מייל או WhatsApp) ונפעיל את הניסיון תוך 24 שעות.", "Send us the message (email or WhatsApp) and we activate your trial within 24h.")}</p>`;
      });
    });
  }

  function init() { bindReveals(); renderCheckout(); renderTrial(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  document.addEventListener("langchange", () => { renderCheckout(); renderTrial(); });
})();
