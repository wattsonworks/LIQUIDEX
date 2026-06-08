/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX — SITE CONFIG                                        ║
   ║  👉 EDIT THE VALUES BELOW. Everything the site needs to take   ║
   ║     payments and grant access lives here. Search "FILL ME".    ║
   ╚══════════════════════════════════════════════════════════════╝ */
window.LIQUIDEX_CONFIG = {
  /* ── Pricing ─────────────────────────────────────────────── */
  priceUSD: 100,            // base monthly price (USD)
  vatRate: 0.18,            // Israeli VAT (18%). Applied where required (see per-method `vat`).
  currencySymbol: "$",

  /* ── Contact / access ────────────────────────────────────── */
  contactEmail: "FILL ME — your@email.com",     // where buyers send their TradingView username
  telegram: "",                                  // optional: "https://t.me/yourhandle"
  whatsapp: "",                                  // optional: "+9725XXXXXXXX" (digits only, intl)
  supportHours: { he: "א׳–ה׳ 09:00–18:00", en: "Sun–Thu 09:00–18:00 (Israel time)" },

  /* ── Payment methods ─────────────────────────────────────────
     Set `enabled:false` to hide a method. `vat:true` adds 18% on top.
     For each method, fill the marked values.                      */
  payments: {
    isracart: {
      enabled: true,
      vat: true,
      status: "coming-soon",   // "coming-soon" until API arrives (~2 days), then "live"
      // FILL ME after IsraCart sends your API/iframe URL or hosted-page link:
      checkoutUrl: "",         // e.g. "https://direct.isracard.co.il/...your hosted page..."
      apiKey: "",              // if they give a key for client init (kept public-safe ones only)
    },
    crypto: {
      enabled: true,
      vat: true,               // crypto +18% VAT per request
      // FILL ME — your receiving addresses:
      networks: [
        { coin: "USDT", chain: "TRC20 (Tron)", address: "FILL ME — TRON USDT address" },
        { coin: "USDT", chain: "ERC20 (Ethereum)", address: "FILL ME — ERC20 USDT address" },
        { coin: "USDC", chain: "ERC20 (Ethereum)", address: "FILL ME — ERC20 USDC address" },
      ],
    },
    bit: {
      enabled: true,
      vat: false,
      phone: "FILL ME — Bit phone number",        // the number buyers send Bit to
      name: "FILL ME — name on the Bit account",
    },
    bank: {
      enabled: true,
      vat: false,
      bankName: "FILL ME — bank name",
      branch: "FILL ME — branch no.",
      account: "FILL ME — account no.",
      beneficiary: "FILL ME — account holder name",
      iban: "FILL ME — IL.. IBAN (for intl. transfers)",
      swift: "FILL ME — SWIFT/BIC",
    },
    cash: {
      enabled: true,
      vat: false,
      // FILL ME — how/where cash is handed over, or remove if not offered publicly:
      note: { he: "תיאום מסירה במזומן בהודעה.", en: "Arrange cash handover by message." },
    },
  },

  /* ── TradingView ─────────────────────────────────────────── */
  tradingview: {
    scriptName: "LIQUIDEX — Institutional Liquidity Scanner",
    // FILL ME (optional) — public invite-only script link once published:
    inviteUrl: "",
  },
};
