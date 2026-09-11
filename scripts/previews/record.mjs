// Records a scripted scroll-through of each live site for the portfolio previews.
// Usage: node scripts/previews/record.mjs [slug ...]   (needs: npm i -D playwright, Google Chrome installed)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('.previews-raw');
fs.mkdirSync(OUT, { recursive: true });

const W = 1440, H = 900;

const SITES = [
  { slug: 'cliffline', url: 'https://cliffline-house.vercel.app', settle: 7000,
    plan: [['idle', 1800], ['scrollTo', 0.55, 11000], ['idle', 800]] },
  { slug: 'sipfx', url: 'https://sipfx.vercel.app', settle: 7000,
    plan: [['idle', 1800], ['scrollTo', 0.55, 11000], ['idle', 800]] },
  { slug: 'jagaterra', url: 'https://jagaterra.vercel.app', settle: 6000,
    plan: [['idle', 2200], ['scrollTo', 0.6, 11000], ['idle', 800]] },
  { slug: 'sapi', url: 'https://jagaterameledak.vercel.app', settle: 5000,
    plan: [['idle', 1200], ['pump', 'button[aria-label="Pompa si sapi"]', 5, 950], ['idle', 3800], ['scrollBy', 900, 3000], ['idle', 1200]] },
  { slug: 'laufee', url: 'https://newshampoo.vercel.app', settle: 7000,
    plan: [['idle', 1800], ['scrollTo', 0.7, 11000], ['idle', 800]] },
  { slug: 'laufee-lenis', url: 'https://lenisshampoo.vercel.app', settle: 7000,
    plan: [['idle', 1800], ['scrollTo', 0.7, 11000], ['idle', 800]] },
  { slug: 'felaufee', url: 'https://3dsampo.vercel.app', settle: 6000,
    plan: [['idle', 1600], ['scrollTo', 0.92, 11000], ['idle', 1000]] },
];

const only = process.argv.slice(2);
const list = only.length ? SITES.filter(s => only.includes(s.slug)) : SITES;

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
});

async function smoothWheel(page, total, ms) {
  const step = 16;
  const n = Math.max(1, Math.round(ms / step));
  // ease-in-out so the clip starts and ends gently
  let done = 0;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const target = Math.round(total * e);
    const dy = target - done;
    done = target;
    if (dy) await page.mouse.wheel(0, dy);
    await page.waitForTimeout(step);
  }
}

for (const site of list) {
  const dir = path.join(OUT, site.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir, size: { width: W, height: H } },
  });
  const t0 = Date.now();
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: 'load', timeout: 90000 });
  } catch (e) { console.log(site.slug, 'goto warn', e.message.split('\n')[0]); }
  await page.mouse.move(W / 2, H / 2);
  await page.waitForTimeout(site.settle);
  await page.screenshot({ path: path.join(dir, 'poster.png') });
  const start = (Date.now() - t0) / 1000;
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const [kind, a, b, c] of site.plan) {
    if (kind === 'idle') await page.waitForTimeout(a);
    else if (kind === 'scrollTo') {
      const y = await page.evaluate(() => window.scrollY);
      await smoothWheel(page, Math.max(0, (scrollH - H) * a - y), b);
    } else if (kind === 'scrollBy') await smoothWheel(page, a, b);
    else if (kind === 'pump') {
      for (let i = 0; i < b; i++) {
        try { await page.click(a, { timeout: 4000, force: true }); } catch (e) { console.log('click fail', i, e.message.split('\n')[0]); }
        await page.waitForTimeout(c);
      }
    }
  }
  await page.screenshot({ path: path.join(dir, 'end.png') });
  const end = (Date.now() - t0) / 1000;
  await ctx.close();
  const vid = fs.readdirSync(dir).find(f => f.endsWith('.webm'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ start, end, scrollH, vid }, null, 2));
  console.log(site.slug, { start: start.toFixed(2), end: end.toFixed(2), scrollH, vid });
}
await browser.close();
