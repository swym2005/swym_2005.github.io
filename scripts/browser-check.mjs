import { spawn } from 'node:child_process';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(project, '.preview');
await mkdir(output, { recursive: true });
const browser = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--disable-background-networking', '--remote-debugging-port=9231', `--user-data-dir=${path.join(output, 'browser-profile')}`,
  '--window-size=1440,1100', 'about:blank'
], { windowsHide: true, stdio: 'ignore' });
let browserError;
browser.on('error', error => { browserError = error; });
let socket;
const pending = new Map();
let nextId = 0;
const errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function assert(condition, message) { if (!condition) throw new Error(message); }
async function cdp(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 10000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}
async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); }
async function screenshot(name) {
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path.join(output, name), Buffer.from(shot.data, 'base64'));
}
try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (browserError) throw browserError;
    try { tabs = await fetch('http://127.0.0.1:9231/json/list').then(response => response.json()); break; } catch { await delay(250); }
  }
  assert(tabs?.length, 'Headless browser did not start');
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const call = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) call.reject(new Error(message.error.message)); else call.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  };
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173' });
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await evaluate(`document.readyState === 'complete' && document.querySelectorAll('.chart-point').length === 6`)) break;
    await delay(100);
  }
  assert(await evaluate(`document.querySelector('#revenue-total').textContent === '₹84,320'`), 'Default revenue total is incorrect');
  assert(await evaluate(`document.querySelector('#orders-total').textContent === '1,248'`), 'Default order total is incorrect');
  assert(await evaluate(`document.querySelector('#customers-total').textContent === '846'`), 'Default customer total is incorrect');
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Desktop layout overflows');
  await delay(1700);
  await screenshot('desktop.png');
  for (const range of [3, 6, 12]) {
    await click(`[data-range="${range}"]`);
    for (const metric of ['revenue', 'orders', 'customers']) {
      await click(`[data-metric="${metric}"]`);
      const snapshot = await evaluate(`({points:document.querySelectorAll('.chart-point').length,title:document.querySelector('#chart-title').textContent,selected:document.querySelector('[data-metric="${metric}"]').getAttribute('aria-pressed'),tableRows:document.querySelector('#data-table-body').children.length,insight:document.querySelector('#chart-insight').textContent})`);
      assert(snapshot.points === range && snapshot.tableRows === range, `Data view is incorrect for ${metric}/${range}`);
      assert(snapshot.selected === 'true' && snapshot.title.toLowerCase().includes(metric), 'Metric selection did not update');
      assert(snapshot.insight.includes(`${range}-month`), 'Insight did not update');
    }
  }
  await evaluate(`document.querySelector('.chart-point').focus()`);
  const tooltipCheck = await evaluate(`({visible:!document.querySelector('#chart-tooltip').hidden,focused:document.activeElement.outerHTML,documentFocus:document.hasFocus()})`);
  assert(tooltipCheck.visible, `Keyboard chart tooltip did not appear: ${JSON.stringify(tooltipCheck)}`);
  await click('.data-toggle');
  assert(await evaluate(`!document.querySelector('#data-table-wrap').hidden`), 'Data table did not open');
  await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: output });
  await click('.download-data');
  let csvFile;
  for (let attempt = 0; attempt < 20; attempt++) {
    csvFile = (await readdir(output)).find(file => file === 'illustrative-retail-data-12-months.csv');
    if (csvFile) break;
    await delay(100);
  }
  assert(csvFile, 'CSV download failed');
  const csv = await readFile(path.join(output, csvFile), 'utf8');
  assert(csv.split('\r\n').length === 13 && csv.startsWith('Month,Revenue (INR),Orders,Customers'), 'CSV content is incorrect');
  await click('.data-toggle');
  await click('[data-range="6"]');
  await click('[data-metric="revenue"]');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate('window.scrollTo(0,0)');
  await delay(150);
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Mobile layout overflows');
  await click('.menu-toggle');
  assert(await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true'`), 'Mobile menu did not open');
  await click('nav a[href="#about"]');
  assert(await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false'`), 'Mobile menu did not close');
  await evaluate('window.scrollTo(0,0)');
  await delay(300);
  await screenshot('mobile.png');
  await evaluate(`document.querySelector('#explore').scrollIntoView({behavior:'instant'})`);
  await screenshot('mobile-chart.png');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 780, deviceScaleFactor: 1, mobile: true });
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Small mobile layout overflows');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Tablet layout overflows');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert(await evaluate(`getComputedStyle(document.documentElement).scrollBehavior === 'auto'`), 'Reduced-motion preference is not respected');
  // Verify the recruiter journey, real assets, and deep-linked case studies.
  const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:4173';
  async function ready(pathname) {
    for (let attempt=0;attempt<50;attempt++) {
      try { if(await evaluate(`document.readyState === 'complete' && location.pathname === ${JSON.stringify(pathname)}`)) return; } catch {}
      await delay(100);
    }
    throw new Error(`Page not ready: ${pathname}`);
  }
  await cdp('Page.navigate',{url:base+'/index.html'});
  await ready('/index.html');
  assert(await evaluate(`document.querySelector('h1').textContent.replace(/\\s/g,'').includes('SwayamDalal')`),'Homepage name is missing');
  assert(await evaluate(`document.querySelector('.portrait-frame img').naturalWidth > 0`),'Portrait failed to load');
  assert(await evaluate(`document.querySelectorAll('.contact-links a').length === 4 && document.querySelector('a[href="tel:+917486074369"]') && document.querySelector('a[href="https://github.com/swym2005"]') && document.querySelector('a[href="https://www.linkedin.com/in/swayam-dalal"]') && document.querySelector('a[href="mailto:swayamndal@gmail.com"]') ? true:false`),'Resume contact links are missing');
  await click('.hero-actions a[href="projects.html"]');
  await ready('/projects.html');
  assert(await evaluate(`document.querySelectorAll('#all-projects .case-card').length === 4`),'Four projects are not listed');
  const domains=['Customer analytics','Credit risk','Retail analytics','Operations analytics'];
  for(const domain of domains){
    await click(`[data-filter="${domain}"]`);
    assert(await evaluate(`document.querySelectorAll('#all-projects .case-card:not([hidden])').length === 1 && document.querySelector('#all-projects .case-card:not([hidden])').dataset.category === ${JSON.stringify(domain)}`),`Broken project filter: ${domain}`);
  }
  await click('[data-filter="all"]');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
  await screenshot('projects-desktop.png');
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'),'Projects listing overflows on mobile');
  await screenshot('projects-mobile.png');
  const slugs=['customer-churn','vehicle-loan-credit-risk','customer-shopping-behavior','supply-chain-operations'];
  await click('#all-projects .case-card');
  await ready('/projects/customer-churn.html');
  for(const slug of slugs){
    await cdp('Page.navigate',{url:`${base}/projects/${slug}.html`});
    await ready(`/projects/${slug}.html`);
    assert(await evaluate(`document.querySelectorAll('.case-metrics dd').length === 3 && document.querySelector('#process') && document.querySelector('#findings') && document.querySelector('#source') ? true:false`),`Incomplete case study: ${slug}`);
    for(const width of [320,390,768,1440]){
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:width===1440?1100:844,deviceScaleFactor:1,mobile:width<600});
      assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'),`${slug} overflows at ${width}px`);
    }
    if(slug==='customer-churn')await screenshot('case-study-desktop.png');
    if(slug==='vehicle-loan-credit-risk'){
      await evaluate(`document.querySelector('#dashboard').scrollIntoView({behavior:'instant'})`);
      await delay(200);
      assert(await evaluate(`Array.from(document.querySelectorAll('.dashboard-figure img')).every(img=>img.complete && img.naturalWidth>0)`),'Dashboard screenshots failed to load');
      await screenshot('dashboard-detail.png');
    }
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await evaluate('scrollTo(0,0)');
    if(slug==='customer-churn')await screenshot('case-study-mobile.png');
  }
  await click('.back-link');
  await ready('/projects.html');
  const reportFiles=['Swayam-Dalal-Resume.pdf','reports/customer-churn-analytics.pdf','reports/vehicle-loan-credit-risk.pdf','reports/customer-shopping-behavior.pdf'];
  for(const file of reportFiles){
    const response=await fetch(`${base}/assets/${file}`);
    assert(response.status===200 && response.headers.get('content-type').includes('application/pdf'),`PDF response failed: ${file}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert(bytes.subarray(0,5).toString()==='%PDF-',`Invalid PDF: ${file}`);
  }
  const portraitResponse=await fetch(`${base}/assets/swayam-dalal.jpg`);
  assert(portraitResponse.status===200 && portraitResponse.headers.get('content-type')==='image/jpeg','Portrait MIME type is incorrect');
  assert(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  const report = { result: 'passed', tested: ['Desktop, tablet, 390px and 320px mobile layouts', 'All 9 chart metric/timeframe combinations', 'Calculated totals and dynamic insight', 'Keyboard chart tooltips', 'Data table toggle and CSV content', 'Mobile menu open and dismiss', 'Reduced-motion preference', 'Name, portrait, and all 4 resume contact links', 'Homepage to projects to individual case study and back', 'All 4 domain filters and all-project reset', 'Direct access to every case study at 4 viewport widths', 'Original dashboard image loading', 'All 4 PDFs return valid PDF bytes and content types', 'No browser runtime errors'], screenshots: ['desktop.png', 'mobile.png', 'mobile-chart.png','projects-desktop.png','projects-mobile.png','case-study-desktop.png','case-study-mobile.png','dashboard-detail.png'] };
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close'); } catch {} socket.close(); }
  if (browser.exitCode === null) browser.kill();
}
