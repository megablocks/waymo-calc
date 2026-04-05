function toggleExplainer(id, button) {
  var el = document.getElementById(id);
  var arrow = button.querySelector('.toggle-arrow');
  var hidden = el.classList.toggle('hidden');
  arrow.style.transform = hidden ? '' : 'rotate(90deg)';
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

function fmtPct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

function calc() {
  var nw = parseFloat(document.getElementById('netWorth').value) || 10000000;
  var waymoAlloc = parseFloat(document.getElementById('waymoAlloc').value) / 100;
  var sellPct = parseFloat(document.getElementById('sellPct').value) / 100;
  var horizon = parseFloat(document.getElementById('horizon').value);
  var salePremium = (parseFloat(document.getElementById('salePremium').value) || 0) / 100;
  var wr = parseFloat(document.getElementById('waymoReturn').value) / 100;
  var wv = parseFloat(document.getElementById('waymoVol').value) / 100;
  var mr = parseFloat(document.getElementById('mktReturn').value) / 100;
  var mv = parseFloat(document.getElementById('mktVol').value) / 100;
  var rfr = parseFloat(document.getElementById('rfr').value) / 100;

  document.getElementById('waymoAllocVal').textContent = Math.round(waymoAlloc * 100) + '%';
  document.getElementById('sellPctVal').textContent = Math.round(sellPct * 100) + '%';
  document.getElementById('horizonVal').textContent = horizon;
  document.getElementById('horizonLabel').textContent = horizon;
  document.getElementById('waymoReturnVal').textContent = Math.round(wr * 100) + '%';
  document.getElementById('waymoVolVal').textContent = Math.round(wv * 100) + '%';
  document.getElementById('mktReturnVal').textContent = Math.round(mr * 100) + '%';
  document.getElementById('mktVolVal').textContent = Math.round(mv * 100) + '%';
  document.getElementById('rfrVal').textContent = (rfr * 100).toFixed(1) + '%';

  var waymoVal = nw * waymoAlloc;
  var otherVal = nw - waymoVal;

  var sellAmount = waymoVal * sellPct * (1 + salePremium);
  var postSaleWaymoVal = waymoVal * (1 - sellPct);
  var postSaleOther = otherVal + sellAmount;
  var postSaleNW = postSaleWaymoVal + postSaleOther;
  var sellAlloc = postSaleWaymoVal / postSaleNW;

  var kellyWaymo = (wr - rfr) / (wv * wv);
  var sharpeWaymo = (wr - rfr) / wv;
  var sharpeMkt = (mr - rfr) / mv;

  document.getElementById('kellyMetrics').innerHTML =
    '<div class="mc"><div class="ml">Kelly optimal — Waymo</div><div class="mv">' + Math.min(Math.round(kellyWaymo * 100), 200) + '%' + (kellyWaymo > 2 ? '+' : '') + '</div><div class="ms">of total portfolio</div></div>' +
    '<div class="mc"><div class="ml">Your current Waymo</div><div class="mv">' + Math.round(waymoAlloc * 100) + '%</div><div class="ms">' + fmt(waymoVal) + '</div></div>' +
    '<div class="mc"><div class="ml">Post-sale Waymo</div><div class="mv">' + Math.round(sellAlloc * 100) + '%</div><div class="ms">' + fmt(postSaleWaymoVal) + '</div></div>' +
    '<div class="mc"><div class="ml">Sale proceeds</div><div class="mv">' + fmt(sellAmount) + '</div><div class="ms">at +' + (salePremium * 100).toFixed(2) + '% premium</div></div>';

  var kellyVal = kellyWaymo * 100;
  document.getElementById('kellyNote').textContent = kellyVal >= waymoAlloc * 100 * 0.9
    ? 'Kelly says your ' + Math.round(waymoAlloc * 100) + '% is ' + (kellyVal > waymoAlloc * 100 ? 'below' : 'near') + ' optimal at ' + Math.round(kellyVal) + '% — holding makes sense on these assumptions.'
    : 'Kelly says optimal is ' + Math.round(kellyVal) + '% — your ' + Math.round(waymoAlloc * 100) + '% is above optimal. Selling ' + Math.round(sellPct * 100) + '% moves you closer.';

  var sw = sharpeWaymo >= sharpeMkt ? '#1D9E75' : '#D85A30';
  document.getElementById('sharpeMetrics').innerHTML =
    '<div class="mc"><div class="ml">Sharpe — Waymo</div><div class="mv" style="color:' + sw + '">' + sharpeWaymo.toFixed(2) + '</div><div class="ms">(return − rfr) / vol</div></div>' +
    '<div class="mc"><div class="ml">Sharpe — market</div><div class="mv">' + sharpeMkt.toFixed(2) + '</div><div class="ms">(return − rfr) / vol</div></div>' +
    '<div class="mc"><div class="ml">Waymo vs market edge</div><div class="mv" style="color:' + sw + '">' + (sharpeWaymo >= sharpeMkt ? '+' : '') + (sharpeWaymo - sharpeMkt).toFixed(2) + '</div><div class="ms">Sharpe difference</div></div>' +
    '<div class="mc"><div class="ml">Interpretation</div><div class="mv" style="font-size:13px;font-weight:400;margin-top:4px;color:#888">' + (sharpeWaymo > sharpeMkt ? 'Waymo better risk-adjusted' : 'Market better risk-adjusted') + '</div></div>';

  var scenarios = [
    { name: 'Bear', waymoAnnual: wr - wv },
    { name: 'Base', waymoAnnual: wr },
    { name: 'Bull', waymoAnnual: wr + 1.5 * wv }
  ];

  var t = '<div class="sgrid"><div class="sh">Scenario</div><div class="sh">Hold all</div><div class="sh">Sell ' + Math.round(sellPct * 100) + '%</div>';

  scenarios.forEach(function (s) {
    var wg = Math.pow(1 + s.waymoAnnual, horizon);
    var mg = Math.pow(1 + mr, horizon);
    var ht = waymoVal * wg + otherVal * mg;
    var st = postSaleWaymoVal * wg + postSaleOther * mg;
    var hp = ((ht / nw) - 1) * 100;
    var sp = ((st / nw) - 1) * 100;

    t += '<div class="sc" style="font-weight:500">' + s.name + '<br><span style="font-size:11px;color:#aaa">' + fmtPct(s.waymoAnnual * 100) + '/yr</span></div>';
    t += '<div class="sc"><span class="' + (hp >= 0 ? 'pos' : 'neg') + '">' + fmt(ht) + '</span><br><span style="font-size:11px;color:#aaa">' + fmtPct(hp) + ' total</span></div>';
    t += '<div class="sc"><span class="' + (sp >= 0 ? 'pos' : 'neg') + '">' + fmt(st) + '</span><br><span style="font-size:11px;color:#aaa">' + fmtPct(sp) + ' total</span></div>';
  });

  t += '</div>';
  document.getElementById('scenarioTable').innerHTML = t;
}

['netWorth', 'waymoAlloc', 'sellPct', 'horizon', 'salePremium', 'waymoReturn', 'waymoVol', 'mktReturn', 'mktVol', 'rfr'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', calc);
});

document.querySelectorAll('.toggle[data-target]').forEach(function (button) {
  button.addEventListener('click', function () {
    toggleExplainer(button.dataset.target, button);
  });
});

calc();
