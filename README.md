# LIQUIDEX — sales & documentation site

Bilingual (Hebrew default / English) marketing + documentation site for the **LIQUIDEX**
institutional liquidity scanner (TradingView Pine Script v6). Sold at **$100/month**,
invite-only access.

Live: **https://wattsonworks.github.io/LIQUIDEX/**

## ⚠️ Product source is NOT in this repo
`LIQUIDEX.txt` (the paid Pine script) is **gitignored on purpose** — this is a public repo
and committing the source would give the $100/mo product away for free. Keep it local only.

## Structure
```
index.html        Landing / sales page (the "big fish" thesis + cascade playbook)
manual.html       Full function-by-function documentation (every engine, with a visual)
checkout.html     Payment page (renders from config.js)
thank-you.html    Post-payment: collect TradingView username
404.html
assets/css/liquidex.css   Design system (matrix-terminal, RTL/LTR)
assets/js/i18n.js         Bilingual engine (data-he / data-en, default Hebrew)
assets/js/config.js       👉 ALL payment + contact settings live here ("FILL ME")
assets/js/charts.js       Pure-SVG chart recreations (hero, liqpool, cascade, …)
assets/js/app.js          Reveals, copy buttons, config-driven checkout renderer
assets/img/               Drop real TradingView screenshots here to replace mockups
```

## To finish setup (you)
Open **`assets/js/config.js`** and replace every `FILL ME`:
- `contactEmail` — where buyers send their TradingView username.
- **IsraCart**: once they send the API/hosted-page link (~2 days), set
  `payments.isracart.checkoutUrl` and flip `status` to `"live"`.
- **Crypto**: paste your USDT (TRC20/ERC20) and USDC receiving addresses.
- **Bit**: your Bit phone number + account name.
- **Bank**: bank / branch / account / IBAN / SWIFT.
- **Cash**: edit or disable.

VAT: `vatRate` is 0.18 (18%). Methods with `vat:true` (card, crypto) show price + VAT + total.

## Swapping mockups for real screenshots
Each recreated chart is a `<div data-chart="NAME">`. To use a real screenshot instead,
put `<img src="assets/img/NAME.png">` inside that div and delete the `data-chart` attribute.

## Deploy
GitHub Pages serves the `main` branch root. Push to `main`; Pages is enabled in repo settings.
`.nojekyll` is present so all asset folders are served as-is.
