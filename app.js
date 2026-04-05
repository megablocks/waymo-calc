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

function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function calculate() {
  const netWorth = parseFloat(document.getElementById('netWorth').value) || 10000000;
  const waymoAllocation = parseFloat(document.getElementById('waymoAlloc').value) / 100;
  const sellPercent = parseFloat(document.getElementById('sellPct').value) / 100;
  const horizon = parseFloat(document.getElementById('horizon').value);
  const salePremium = (parseFloat(document.getElementById('salePremium').value) || 0) / 100;
  const waymoReturn = parseFloat(document.getElementById('waymoReturn').value) / 100;
  const waymoVolatility = parseFloat(document.getElementById('waymoVol').value) / 100;
  const marketReturn = parseFloat(document.getElementById('mktReturn').value) / 100;
  const marketVolatility = parseFloat(document.getElementById('mktVol').value) / 100;
  const riskFreeRate = parseFloat(document.getElementById('rfr').value) / 100;

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
  const saleProceeds = waymoValue * sellPercent * (1 + salePremium);
  const postSaleWaymoValue = waymoValue * (1 - sellPercent);
  const postSaleOtherValue = otherValue + saleProceeds;
  const postSaleNetWorth = postSaleWaymoValue + postSaleOtherValue;
  const postSaleAllocation = postSaleWaymoValue / postSaleNetWorth;

  const kellyWaymo = (waymoReturn - riskFreeRate) / (waymoVolatility * waymoVolatility);
  const sharpeWaymo = (waymoReturn - riskFreeRate) / waymoVolatility;
  const sharpeMarket = (marketReturn - riskFreeRate) / marketVolatility;

  document.getElementById('kellyMetrics').innerHTML =
    `<div class="mc"><div class="ml">Kelly optimal — Waymo</div><div class="mv">${Math.min(Math.round(kellyWaymo * 100), 200)}%${kellyWaymo > 2 ? '+' : ''}</div><div class="ms">of total portfolio</div></div>` +
    `<div class="mc"><div class="ml">Your current Waymo</div><div class="mv">${Math.round(waymoAllocation * 100)}%</div><div class="ms">${formatCurrency(waymoValue)}</div></div>` +
    `<div class="mc"><div class="ml">Post-sale Waymo</div><div class="mv">${Math.round(postSaleAllocation * 100)}%</div><div class="ms">${formatCurrency(postSaleWaymoValue)}</div></div>` +
    `<div class="mc"><div class="ml">Sale proceeds</div><div class="mv">${formatCurrency(saleProceeds)}</div><div class="ms">at +${(salePremium * 100).toFixed(2)}% premium</div></div>`;

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

    scenarioHtml += `<div class="sc" style="font-weight:500">${scenario.name}<br><span style="font-size:11px;color:#aaa">${formatPercent(scenario.waymoAnnual * 100)}/yr</span></div>`;
    scenarioHtml += `<div class="sc"><span class="${holdPercent >= 0 ? 'pos' : 'neg'}">${formatCurrency(holdTotal)}</span><br><span style="font-size:11px;color:#aaa">${formatPercent(holdPercent)} total</span></div>`;
    scenarioHtml += `<div class="sc"><span class="${sellScenarioPercent >= 0 ? 'pos' : 'neg'}">${formatCurrency(sellTotal)}</span><br><span style="font-size:11px;color:#aaa">${formatPercent(sellScenarioPercent)} total</span></div>`;
  });

  scenarioHtml += '</div>';
  document.getElementById('scenarioTable').innerHTML = scenarioHtml;
}

function initialize() {
  ['netWorth', 'waymoAlloc', 'sellPct', 'horizon', 'salePremium', 'waymoReturn', 'waymoVol', 'mktReturn', 'mktVol', 'rfr'].forEach((id) => {
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
