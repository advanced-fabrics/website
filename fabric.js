// AdvFab hero: an illustrative leaf-spine fabric whose links carry the states of the
// public, hashed path assessments in /wiki/data/cluster-snapshot.json.
(function () {
  var root = document.querySelector('[data-fabric]');
  if (!root) return;
  var copy = JSON.parse(document.getElementById('site-copy').textContent);
  var NS = 'http://www.w3.org/2000/svg';
  var svg = root.querySelector('svg');
  var info = root.querySelector('[data-fabric-info]');
  var gatesHost = root.querySelector('[data-fabric-gates]');
  var verdict = root.querySelector('[data-fabric-verdict]');
  var legend = root.querySelector('[data-fabric-legend]');
  var stamp = root.querySelector('[data-fabric-stamp]');

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (parent) parent.appendChild(node);
    return node;
  }
  function text(parent, x, y, value, cls, anchor) {
    var node = el('text', { x: x, y: y, class: cls, 'text-anchor': anchor || 'middle' }, parent);
    node.textContent = value;
    return node;
  }

  var spines = [{ id: 's1', x: 210, y: 46 }, { id: 's2', x: 390, y: 46 }];
  var leaves = [{ id: 'l1', x: 84, y: 172 }, { id: 'l2', x: 228, y: 172 }, { id: 'l3', x: 372, y: 172 }, { id: 'l4', x: 516, y: 172 }];
  var nodes = [
    { leaf: 0, x: 44 }, { leaf: 0, x: 124 }, { leaf: 1, x: 192 }, { leaf: 1, x: 264 },
    { leaf: 2, x: 336 }, { leaf: 2, x: 408 }, { leaf: 3, x: 516 }
  ].map(function (node) { node.y = 304; return node; });
  var links = [];
  spines.forEach(function (spine) { leaves.forEach(function (leaf) { links.push({ a: spine, b: leaf, tier: 'spine' }); }); });
  nodes.forEach(function (node) { links.push({ a: leaves[node.leaf], b: node, tier: 'leaf', node: node }); });

  var fallback = { generatedAt: null, totals: { pathAssessments: 15 }, pathAssessments: [] };
  var STATES = ['Ready', 'Partial', 'Stale', 'Unknown'];
  var gates = copy.gates.map(function (label, index) { return { label: label, on: index === 0 || index === 2 }; });
  var selected = null;

  var gLinks = el('g', {}, svg);
  var gNodes = el('g', {}, svg);
  text(svg, 18, 50, copy.tierSpine, 'svg-label', 'start');
  text(svg, 18, 176, copy.tierLeaf, 'svg-label', 'start');
  el('line', { x1: 18, x2: 582, y1: 236, y2: 236, stroke: 'var(--line)', 'stroke-dasharray': '2 4' }, svg);
  text(svg, 18, 352, copy.tierNode, 'svg-label', 'start');

  function stateKey(state) { return STATES.indexOf(state) >= 0 ? state.toLowerCase() : 'unknown'; }
  function strokeFor(key) {
    return {
      ready: { stroke: 'var(--ok)', dash: '' },
      partial: { stroke: 'var(--warn)', dash: '7 5' },
      stale: { stroke: 'var(--bad)', dash: '1.5 5' },
      unknown: { stroke: 'var(--unknown)', dash: '9 7' }
    }[key];
  }

  function drawNodes() {
    spines.concat(leaves).forEach(function (point) {
      el('rect', { x: point.x - 30, y: point.y - 14, width: 60, height: 28, rx: 7, class: 'svg-node' }, gNodes);
      text(gNodes, point.x, point.y + 4, point.id.toUpperCase(), 'svg-title');
    });
    nodes.forEach(function (node, index) {
      node.shape = el('circle', { cx: node.x, cy: node.y, r: 12, class: 'svg-node' }, gNodes);
      text(gNodes, node.x, node.y + 30, 'n' + (index + 1), 'svg-mono');
    });
  }

  function render(snapshot) {
    var items = snapshot.pathAssessments || [];
    links.forEach(function (link, index) {
      var item = items[index] || { id: null, state: 'Unknown', nodeReady: null, pathEvidence: 0, evidenceRefs: 0, observedAt: null };
      link.item = item;
      var key = stateKey(item.state);
      var style = strokeFor(key);
      var group = el('g', { class: 'hit', tabindex: '0', role: 'button', 'aria-pressed': 'false', 'aria-label': copy.linkLabel.replace('{state}', copy.states[key]).replace('{id}', item.id || '—') }, gLinks);
      el('line', { x1: link.a.x, y1: link.a.y + 14, x2: link.b.x, y2: link.b.y - (link.tier === 'leaf' ? 12 : 14), stroke: 'transparent', 'stroke-width': 16 }, group);
      link.halo = el('line', { x1: link.a.x, y1: link.a.y + 14, x2: link.b.x, y2: link.b.y - (link.tier === 'leaf' ? 12 : 14), stroke: 'var(--accent)', 'stroke-opacity': 0, 'stroke-width': 9, 'stroke-linecap': 'round' }, group);
      el('line', { x1: link.a.x, y1: link.a.y + 14, x2: link.b.x, y2: link.b.y - (link.tier === 'leaf' ? 12 : 14), stroke: style.stroke, 'stroke-width': 2.4, 'stroke-dasharray': style.dash, 'stroke-linecap': 'round' }, group);
      if (key === 'unknown') {
        var mx = (link.a.x + link.b.x) / 2, my = (link.a.y + link.b.y) / 2;
        el('circle', { cx: mx, cy: my, r: 8, fill: 'var(--surface)', stroke: 'var(--unknown)' }, group);
        text(group, mx, my + 4, '?', 'svg-label');
      }
      if (link.node) {
        link.node.shape.style.stroke = item.nodeReady === false ? 'var(--bad)' : item.nodeReady ? 'var(--ok)' : 'var(--unknown)';
      }
      group.addEventListener('click', function () { select(link); });
      group.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(link); }
      });
      link.group = group;
    });

    var counts = { ready: 0, partial: 0, stale: 0, unknown: 0 };
    items.forEach(function (item) { counts[stateKey(item.state)] += 1; });
    legend.textContent = '';
    ['ready', 'partial', 'stale', 'unknown'].forEach(function (key) {
      var span = document.createElement('span');
      span.className = 'k-' + key;
      span.appendChild(document.createElement('i'));
      span.appendChild(document.createTextNode(copy.states[key] + ' '));
      var count = document.createElement('b');
      count.textContent = String(counts[key]);
      span.appendChild(count);
      legend.appendChild(span);
    });
    if (snapshot.generatedAt && stamp) {
      stamp.textContent = copy.stamp.replace('{time}', new Date(snapshot.generatedAt).toLocaleString(document.documentElement.lang, { dateStyle: 'medium', timeStyle: 'short' })) + ' · ';
    }
    fillStats(snapshot);
    select(links.find(function (link) { return link.item.state === 'Ready'; }) || links[0]);
  }

  function fillStats(snapshot) {
    var set = function (name, value) {
      var target = document.querySelector('[data-stat="' + name + '"]');
      if (target && value !== undefined && value !== null) target.textContent = value;
    };
    if (!snapshot.totals) return;
    set('assessments', snapshot.totals.pathAssessments);
    if (snapshot.nodeReadiness) set('nodes', (snapshot.nodeReadiness.true || 0) + '/' + ((snapshot.nodeReadiness.true || 0) + (snapshot.nodeReadiness.false || 0)));
    set('triangles', snapshot.totals.tradeoffTriangles);
    if (snapshot.totals.observationEpisodes) set('episodes', snapshot.totals.observationEpisodes.returned + (snapshot.totals.observationEpisodes.capped ? '+' : ''));
  }

  function row(list, label, value) {
    var dt = document.createElement('dt');
    dt.textContent = label;
    var dd = document.createElement('dd');
    dd.textContent = value;
    list.appendChild(dt);
    list.appendChild(dd);
  }

  function select(link) {
    selected = link;
    links.forEach(function (other) {
      other.group.setAttribute('aria-pressed', other === link ? 'true' : 'false');
      other.halo.setAttribute('stroke-opacity', other === link ? '0.22' : '0');
    });
    var item = link.item;
    info.textContent = '';
    row(info, copy.fields.id, item.id || copy.none);
    row(info, copy.fields.state, copy.states[stateKey(item.state)]);
    row(info, copy.fields.node, item.nodeReady === true ? copy.ready : item.nodeReady === false ? copy.notReady : copy.none);
    row(info, copy.fields.evidence, item.pathEvidence + ' / ' + item.evidenceRefs);
    row(info, copy.fields.observed, item.observedAt ? new Date(item.observedAt).toLocaleString(document.documentElement.lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : copy.none);
    judge();
  }

  function drawGates() {
    gates.forEach(function (gate) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = gate.label;
      button.setAttribute('aria-pressed', gate.on ? 'true' : 'false');
      button.addEventListener('click', function () {
        gate.on = !gate.on;
        button.setAttribute('aria-pressed', gate.on ? 'true' : 'false');
        judge();
      });
      gatesHost.appendChild(button);
    });
  }

  function judge() {
    if (!selected) return;
    var key = stateKey(selected.item.state);
    var missing = gates.filter(function (gate) { return !gate.on; }).map(function (gate) { return gate.label; });
    var title, detail, state;
    if (key !== 'ready') {
      state = 'hold';
      title = copy.verdict.observeTitle;
      detail = copy.verdict.observe.replace('{state}', copy.states[key]);
    } else if (missing.length) {
      state = 'bad';
      title = copy.verdict.blockedTitle;
      detail = copy.verdict.blocked.replace('{missing}', missing.join(copy.joiner));
    } else {
      state = 'ok';
      title = copy.verdict.okTitle;
      detail = copy.verdict.ok;
    }
    verdict.dataset.state = state;
    verdict.textContent = '';
    var b = document.createElement('b');
    b.textContent = title;
    var span = document.createElement('span');
    span.textContent = detail;
    verdict.appendChild(b);
    verdict.appendChild(span);
  }

  drawNodes();
  drawGates();
  fetch(root.dataset.snapshot, { cache: 'no-store' })
    .then(function (response) { if (!response.ok) throw new Error('snapshot ' + response.status); return response.json(); })
    .then(render)
    .catch(function () { render(fallback); });
})();
