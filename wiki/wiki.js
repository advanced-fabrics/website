const number = new Intl.NumberFormat('en');
const stateClass = value => `state-${String(value).toLowerCase().replace(/[^a-z]+/g, '-')}`;
function renderBars(target, distribution) { const total = Object.values(distribution).reduce((sum, value) => sum + value, 0) || 1; target.innerHTML = Object.entries(distribution).map(([label, value]) => `<div class="bar-row"><span>${label}</span><div><i class="${stateClass(label)}" style="width:${Math.max(3, value / total * 100)}%"></i></div><b>${value}</b></div>`).join(''); }
function metric(label, value, detail) { return `<article><span>${label}</span><strong>${number.format(value)}</strong><small>${detail}</small></article>`; }
async function loadSnapshot() {
  const response = await fetch('/wiki/data/cluster-snapshot.json', {cache: 'no-store'}); if (!response.ok) throw new Error(`snapshot request failed: ${response.status}`); const data = await response.json();
  document.querySelector('#snapshot-time').textContent = new Date(data.generatedAt).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'});
  document.querySelector('#cluster-hash').textContent = `Cluster ${data.source.cluster} · ${data.source.api}`;
  document.querySelector('#metrics').innerHTML = [metric('Path assessments', data.totals.pathAssessments, 'Headlamp-visible resources'), metric('Ready nodes', data.nodeReadiness.true || 0, `${data.nodeReadiness.false || 0} not ready`), metric('Tradeoff triangles', data.totals.tradeoffTriangles, 'Open hypotheses'), metric('Observation episodes', data.totals.observationEpisodes.returned, data.totals.observationEpisodes.capped ? 'bounded result window' : 'complete result')].join('');
  renderBars(document.querySelector('#assessment-states'), data.stateDistribution.pathAssessments); renderBars(document.querySelector('#episode-states'), data.stateDistribution.observationEpisodes);
  document.querySelector('#episode-note').textContent = data.totals.observationEpisodes.capped ? 'The read API returned its 200-item safety limit; this is a lower bound, not a cluster-wide total.' : '';
  document.querySelector('#assessment-rows').innerHTML = data.pathAssessments.map(item => `<tr><td><code>${item.id}</code></td><td><span class="state ${stateClass(item.state)}">${item.state}</span></td><td>${item.nodeReady ? 'Ready' : 'Not ready'}</td><td>${item.pathEvidence}</td><td>${item.evidenceRefs}</td><td><time datetime="${item.observedAt}">${new Date(item.observedAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</time></td></tr>`).join('');
}
loadSnapshot().catch(error => { document.querySelector('#metrics').innerHTML = '<p class="error">The sanitized snapshot could not be loaded.</p>'; console.error(error); });
