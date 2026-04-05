function toggleExplainer(id, button) {
  const element = document.getElementById(id);
  const arrow = button.querySelector('.toggle-arrow');

  if (!element || !arrow) {
    return;
  }

  const hidden = element.classList.toggle('hidden');
  arrow.style.transform = hidden ? '' : 'rotate(90deg)';
}

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatSignedPercent(value, decimals = 1) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

function formatInteger(value) {
  return Math.round(value).toLocaleString();
}

function readNumber(id, fallback) {
  const value = parseFloat(document.getElementById(id).value);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculate() {
  const netWorth = readNumber('netWorth', 10000000);
  const waymoAllocation = readNumber('waymoAlloc', 40) / 100;
  const sellPercent = readNumber('sellPct', 20) / 100;
  const horizon = readNumber('horizon', 4);
  const vestPrice = Math.max(readNumber('vestPrice', 145), 0.01);
  const sellPrice = Math.max(readNumber('sellPrice', 165), 0.01);
  const taxRate = clamp(readNumber('taxRate', 37) / 100, 0, 1);
  const waymoReturn = readNumber('waymoReturn', 22) / 100;
  const waymoVolatility = readNumber('waymoVol', 45) / 100;
  const marketReturn = readNumber('mktReturn', 9) / 100;
  const marketVolatility = readNumber('mktVol', 15) / 100;
  const riskFreeRate = readNumber('rfr', 4.5) / 100;

  document.getElementById('waymoAllocVal').textContent = `${Math.round(waymoAllocation * 100)}%`;
  document.getElementById('sellPctVal').textContent = `${Math.round(sellPercent * 100)}%`;
  document.getElementById('horizonVal').textContent = horizon;
  document.getElementById('horizonLabel').textContent = horizon;
  document.getElementById('waymoReturnVal').textContent = `${Math.round(waymoReturn * 100)}%`;
  document.getElementById('waymoVolVal').textContent = `${Math.round(waymoVolatility * 100)}%`;
  document.getElementById('mktReturnVal').textContent = `${Math.round(marketReturn * 100)}%`;
  document.getElementById('mktVolVal').textContent = `${Math.round(marketVolatility * 100)}%`;
  document.getElementById('rfrVal').textContent = `${(riskFreeRate * 100).toFixed(1)}%`;

  const waymoValue = netWorth * waymoAllocation;
  const otherValue = netWorth - waymoValue;

  const premium = (sellPrice / vestPrice) - 1;
  document.getElementById('salePremiumVal').textContent = formatSignedPercent(premium * 100, 2);

  const soldSharesEquivalent = (waymoValue * sellPercent) / vestPrice;
  const grossProceeds = soldSharesEquivalent * sellPrice;
  const taxableGain = Math.max(0, soldSharesEquivalent * (sellPrice - vestPrice));
  const taxDue = taxableGain * taxRate;
  const afterTaxProceeds = grossProceeds - taxDue;

  const postSaleWaymoValue = waymoValue * (1 - sellPercent);
  const postSaleOtherValue = otherValue + afterTaxProceeds;
  const postSaleNetWorth = postSaleWaymoValue + postSaleOtherValue;
  const postSaleAllocation = postSaleNetWorth > 0 ? postSaleWaymoValue / postSaleNetWorth : 0;

  const kellyWaymo = (waymoReturn - riskFreeRate) / (waymoVolatility * waymoVolatility);
  const sharpeWaymo = (waymoReturn - riskFreeRate) / waymoVolatility;
  const sharpeMarket = (marketReturn - riskFreeRate) / marketVolatility;

  document.getElementById('saleMetrics').innerHTML =
    `<div class="mc"><div class="ml">Sold Waymo share equivalent</div><div class="mv">${formatInteger(soldSharesEquivalent)}</div><div class="ms">based on vest price ${formatCurrency(vestPrice)}</div></div>` +
    `<div class="mc"><div class="ml">Gross sale proceeds</div><div class="mv">${formatCurrency(grossProceeds)}</div><div class="ms">at sell price ${formatCurrency(sellPrice)}</div></div>` +
    `<div class="mc"><div class="ml">Taxable gain</div><div class="mv">${formatCurrency(taxableGain)}</div><div class="ms">realized gain only</div></div>` +
    `<div class="mc"><div class="ml">Tax due</div><div class="mv">${formatCurrency(taxDue)}</div><div class="ms">${(taxRate * 100).toFixed(1)}% on gain</div></div>` +
    `<div class="mc"><div class="ml">After-tax proceeds</div><div class="mv">${formatCurrency(afterTaxProceeds)}</div><div class="ms">cash available to reallocate</div></div>` +
    `<div class="mc"><div class="ml">Post-sale non-Waymo bucket</div><div class="mv">${formatCurrency(postSaleOtherValue)}</div><div class="ms">other assets + after-tax proceeds</div></div>`;

  document.getElementById('kellyMetrics').innerHTML =
    `<div class="mc"><div class="ml">Kelly optimal — Waymo</div><div class="mv">${Math.min(Math.round(kellyWaymo * 100), 200)}%${kellyWaymo > 2 ? '+' : ''}</div><div class="ms">of total portfolio</div></div>` +
    `<div class="mc"><div class="ml">Your current Waymo</div><div class="mv">${Math.round(waymoAllocation * 100)}%</div><div class="ms">${formatCurrency(waymoValue)}</div></div>` +
    `<div class="mc"><div class="ml">Post-sale Waymo</div><div class="mv">${Math.round(postSaleAllocation * 100)}%</div><div class="ms">${formatCurrency(postSaleWaymoValue)}</div></div>` +
    `<div class="mc"><div class="ml">After-tax proceeds used</div><div class="mv">${formatCurrency(afterTaxProceeds)}</div><div class="ms">premium ${formatSignedPercent(premium * 100, 2)}</div></div>`;

  const kellyPercent = kellyWaymo * 100;
  document.getElementById('kellyNote').textContent = kellyPercent >= waymoAllocation * 100 * 0.9
    ? `Kelly says your ${Math.round(waymoAllocation * 100)}% is ${kellyPercent > waymoAllocation * 100 ? 'below' : 'near'} optimal at ${Math.round(kellyPercent)}% — holding makes sense on these assumptions.`
    : `Kelly says optimal is ${Math.round(kellyPercent)}% — your ${Math.round(waymoAllocation * 100)}% is above optimal. Selling ${Math.round(sellPercent * 100)}% moves you closer.`;

  const sharpeColor = sharpeWaymo >= sharpeMarket ? '#1D9E75' : '#D85A30';
  document.getElementById('sharpeMetrics').innerHTML =
    `<div class="mc"><div class="ml">Sharpe — Waymo</div><div class="mv" style="color:${sharpeColor}">${sharpeWaymo.toFixed(2)}</div><div class="ms">(return − rfr) / vol</div></div>` +
    `<div class="mc"><div class="ml">Sharpe — market</div><div class="mv">${sharpeMarket.toFixed(2)}</div><div class="ms">(return − rfr) / vol</div></div>` +
    `<div class="mc"><div class="ml">Waymo vs market edge</div><div class="mv" style="color:${sharpeColor}">${sharpeWaymo >= sharpeMarket ? '+' : ''}${(sharpeWaymo - sharpeMarket).toFixed(2)}</div><div class="ms">Sharpe difference</div></div>` +
    `<div class="mc"><div class="ml">Interpretation</div><div class="mv" style="font-size:13px;font-weight:400;margin-top:4px;color:#888">${sharpeWaymo > sharpeMarket ? 'Waymo better risk-adjusted' : 'Market better risk-adjusted'}</div></div>`;

  const scenarios = [
    { name: 'Bear', waymoAnnual: waymoReturn - waymoVolatility },
    { name: 'Base', waymoAnnual: waymoReturn },
    { name: 'Bull', waymoAnnual: waymoReturn + 1.5 * waymoVolatility }
  ];

  let scenarioHtml = `<div class="sgrid"><div class="sh">Scenario</div><div class="sh">Hold all</div><div class="sh">Sell ${Math.round(sellPercent * 100)}%</div>`;

  scenarios.forEach((scenario) => {
    const waymoGrowth = Math.pow(1 + scenario.waymoAnnual, horizon);
    const marketGrowth = Math.pow(1 + marketReturn, horizon);
    const holdTotal = waymoValue * waymoGrowth + otherValue * marketGrowth;
    const sellTotal = postSaleWaymoValue * waymoGrowth + postSaleOtherValue * marketGrowth;
    const holdPercent = ((holdTotal / netWorth) - 1) * 100;
    const sellScenarioPercent = ((sellTotal / netWorth) - 1) * 100;

    scenarioHtml += `<div class="sc" style="font-weight:500">${scenario.name}<br><span style="font-size:11px;color:#aaa">${formatSignedPercent(scenario.waymoAnnual * 100)}/yr</span></div>`;
    scenarioHtml += `<div class="sc"><span class="${holdPercent >= 0 ? 'pos' : 'neg'}">${formatCurrency(holdTotal)}</span><br><span style="font-size:11px;color:#aaa">${formatSignedPercent(holdPercent)} total</span></div>`;
    scenarioHtml += `<div class="sc"><span class="${sellScenarioPercent >= 0 ? 'pos' : 'neg'}">${formatCurrency(sellTotal)}</span><br><span style="font-size:11px;color:#aaa">${formatSignedPercent(sellScenarioPercent)} total</span></div>`;
  });

  scenarioHtml += '</div>';
  document.getElementById('scenarioTable').innerHTML = scenarioHtml;
}

function initialize() {
  ['netWorth', 'waymoAlloc', 'sellPct', 'vestPrice', 'sellPrice', 'taxRate', 'horizon', 'waymoReturn', 'waymoVol', 'mktReturn', 'mktVol', 'rfr'].forEach((id) => {
    document.getElementById(id).addEventListener('input', calculate);
  });

  document.querySelectorAll('.toggle').forEach((button) => {
    button.addEventListener('click', () => {
      toggleExplainer(button.dataset.target, button);
    });
  });

  calculate();
}

document.addEventListener('DOMContentLoaded', initialize);
