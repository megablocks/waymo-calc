# Waymo equity decision calculator

A small static calculator for evaluating whether to hold or sell part of a concentrated Waymo position using Kelly criterion, Sharpe ratio, and scenario analysis.

## Run locally

No build step is required.

- Option 1: open `index.html` directly in a browser.
- Option 2: serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to Netlify

This repo is Netlify-ready as a static site because `index.html` is at the project root.

1. Push the branch to GitHub.
2. In Netlify: **Add new site** → **Import an existing project**.
3. Select this repository and branch.
4. Netlify picks up `netlify.toml` automatically (`publish = "."`).
5. Deploy.

If you prefer entering settings manually:

- **Build command:** leave empty
- **Publish directory:** `.`

## Model assumptions

- Inputs are annualized rates.
- Kelly uses `(expected return - risk-free rate) / volatility²`.
- Sharpe uses `(expected return - risk-free rate) / volatility`.
- Scenarios for Waymo are:
  - Bear: expected return - 1σ
  - Base: expected return
  - Bull: expected return + 1.5σ
- Market return is held at expected market return in all scenarios.
- Sale math is tax-aware:
  - `premium = (sellPrice / vestPrice - 1)`
  - `soldSharesEquivalent = waymoVal * sellPct / vestPrice`
  - `grossProceeds = soldSharesEquivalent * sellPrice`
  - `taxableGain = max(0, soldSharesEquivalent * (sellPrice - vestPrice))`
  - `taxDue = taxableGain * taxRate`
  - `afterTaxProceeds = grossProceeds - taxDue`
  - `postSaleOther = otherVal + afterTaxProceeds`
- Post-sale scenarios and allocation use **after-tax proceeds** (not gross).
