# Waymo Equity Decision Calculator

Small static calculator for evaluating a concentrated Waymo position using:

- Kelly criterion
- Sharpe ratio comparison
- 3-scenario horizon outcomes (bear/base/bull)

## Run locally

No build step is required.

### Option 1: open directly

Open `index.html` in any modern browser.

### Option 2: serve over a local static server (recommended)

```bash
# from repo root
python3 -m http.server 8080
```

Then visit: `http://localhost:8080/`

## Deploy to Netlify

This repo is static and Netlify-ready as-is because `index.html` is at the repository root.

1. Push this branch to GitHub.
2. In Netlify: **Add new site** → **Import an existing project**.
3. Select this repository and branch.
4. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Deploy.

No `netlify.toml` is required for this setup.

## Assumptions in the model

- Inputs are annualized rates.
- Kelly uses: `(expected return - risk-free rate) / volatility²`.
- Sharpe uses: `(expected return - risk-free rate) / volatility`.
- Scenario engine uses:
  - Bear: Waymo return = expected return - 1σ
  - Base: Waymo return = expected return
  - Bull: Waymo return = expected return + 1.5σ
- Market return is held at expected market return in all scenarios.
- Sale proceeds are immediately added to the non-Waymo portion.
