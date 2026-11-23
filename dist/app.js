(() => {
  'use strict';

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const sample = {
    revenue: [8300, 9600, 9046, 12300, 14350, 17500, 9800, 11200, 10620, 14500, 16900, 21300],
    orders: [130, 144, 138, 185, 230, 283, 150, 168, 162, 210, 248, 310],
    customers: [95, 108, 101, 135, 151, 185, 102, 118, 110, 146, 168, 202]
  };
  const previousYearTotals = { revenue: 131880, orders: 2112, customers: 1470 };
  const labels = { revenue: 'Revenue', orders: 'Orders', customers: 'Customers' };
  const state = { metric: 'revenue', range: 6 };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const format = (metric, value) => `${metric === 'revenue' ? '₹' : ''}${Math.round(value).toLocaleString('en-IN')}`;
  const total = values => values.reduce((sum, value) => sum + value, 0);
  const svgNS = 'http://www.w3.org/2000/svg';
  const sumRange = metric => total(sample[metric].slice(12 - state.range));

  function render() {
    const start = 12 - state.range;
    const values = sample[state.metric].slice(start);
    const maxValue = Math.max(...values);
    const step = state.metric === 'revenue' ? 5000 : 50;
    const ceiling = Math.ceil(maxValue / step) * step;
    const points = values.map((value, index) => ({
      x: 12 + index * (576 / (values.length - 1)),
      y: 218 - value / ceiling * 200,
      value,
      month: months[start + index]
    }));
    const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    $('#line-path').setAttribute('d', line);
    $('#area-path').setAttribute('d', `${line} L588 218 L12 218 Z`);
    $('#explore-chart').setAttribute('preserveAspectRatio', 'none');
    $('#chart-title').textContent = `${labels[state.metric]} over time`;
    $('#chart-description').textContent = `${months[start]} – December · Sample retail dataset`;
    $('#legend-label').textContent = `${labels[state.metric]}${state.metric === 'revenue' ? ' (INR)' : ''}`;
    $('#chart-accessible-description').textContent = `Illustrative ${labels[state.metric].toLowerCase()} data. ${points.map(point => `${point.month}: ${format(state.metric, point.value)}`).join('; ')}.`;
    const yAxis = $('.y-axis');
    const xAxis = $('.x-axis');
    yAxis.replaceChildren();
    xAxis.replaceChildren();
    for (let index = 0; index < 5; index++) {
      const span = document.createElement('span');
      const value = ceiling * (1 - index / 4);
      span.textContent = state.metric === 'revenue' ? `₹${(value / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k` : String(Math.round(value));
      yAxis.append(span);
    }
    points.forEach(point => {
      const span = document.createElement('span');
      span.textContent = point.month.slice(0, 3);
      xAxis.append(span);
    });
    const group = $('#chart-points');
    const tooltip = $('#chart-tooltip');
    tooltip.hidden = true;
    group.replaceChildren();
    points.forEach(point => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('class', 'chart-point');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'img');
      circle.setAttribute('aria-label', `${point.month}: ${format(state.metric, point.value)}`);
      const hit = document.createElementNS(svgNS, 'circle');
      hit.setAttribute('cx', point.x);
      hit.setAttribute('cy', point.y);
      hit.setAttribute('r', '15');
      hit.setAttribute('class', 'chart-hit');
      hit.setAttribute('aria-hidden', 'true');
      const show = () => {
        tooltip.textContent = `${point.month} · ${format(state.metric, point.value)}`;
        tooltip.style.left = `${Math.max(16, Math.min(84, point.x / 600 * 100))}%`;
        tooltip.style.top = `${point.y / 230 * 100 * ($('#explore-chart').clientHeight / $('.plot-wrap').clientHeight)}%`;
        tooltip.hidden = false;
      };
      const hide = () => { tooltip.hidden = true; };
      circle.addEventListener('focus', show);
      circle.addEventListener('blur', hide);
      hit.addEventListener('mouseenter', show);
      hit.addEventListener('mouseleave', hide);
      hit.addEventListener('pointerdown', show);
      group.append(circle, hit);
    });

    $$('.metric').forEach(button => {
      const metric = button.dataset.metric;
      const selected = metric === state.metric;
      const current = sumRange(metric);
      const previous = state.range === 12 ? previousYearTotals[metric] : total(sample[metric].slice(12 - state.range * 2, 12 - state.range));
      const change = (current / previous - 1) * 100;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.querySelector('strong').textContent = format(metric, current);
      button.querySelector('.growth').textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      button.querySelector('.metric-period').textContent = state.range === 12 ? 'vs. previous year' : 'vs. previous period';
      button.setAttribute('aria-label', `${labels[metric]}: ${format(metric, current)}, ${Math.abs(change).toFixed(1)} percent ${change >= 0 ? 'increase' : 'decrease'} versus ${state.range === 12 ? 'the previous year' : 'the previous period'}. Show ${labels[metric].toLowerCase()} chart.`);
    });
    $$('[data-range]').forEach(button => {
      const selected = Number(button.dataset.range) === state.range;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const best = points.reduce((winner, point) => point.value > winner.value ? point : winner);
    const share = (best.value / total(values) * 100).toFixed(1);
    const insight = $('#chart-insight');
    insight.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = `${best.month} leads the way.`;
    insight.append(strong, ` It accounts for ${share}% of ${state.metric} in this ${state.range}-month view.`);
    const body = $('#data-table-body');
    body.replaceChildren();
    for (let index = start; index < 12; index++) {
      const row = document.createElement('tr');
      [months[index], format('revenue', sample.revenue[index]), format('orders', sample.orders[index]), format('customers', sample.customers[index])].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    }
  }
  $$('.metric').forEach(button => button.addEventListener('click', () => { state.metric = button.dataset.metric; render(); }));
  $$('[data-range]').forEach(button => button.addEventListener('click', () => { state.range = Number(button.dataset.range); render(); }));
  $('.data-toggle').addEventListener('click', () => {
    const control = $('.data-toggle');
    const opened = control.getAttribute('aria-expanded') !== 'true';
    control.setAttribute('aria-expanded', String(opened));
    $('#data-table-wrap').hidden = !opened;
    control.firstChild.textContent = opened ? 'Hide the data ' : 'View the data ';
  });
  $('.download-data').addEventListener('click', () => {
    const rows = [['Month', 'Revenue (INR)', 'Orders', 'Customers']];
    for (let index = 12 - state.range; index < 12; index++) rows.push([months[index], sample.revenue[index], sample.orders[index], sample.customers[index]]);
    const blob = new Blob([rows.map(row => row.join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `illustrative-retail-data-${state.range}-months.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();

})();
