#!/usr/bin/env node

const url = process.argv[2] || process.env.CHECK_LIVE_URL || 'https://andybak.github.io/icosa-gallery-vibe-coding-test/';
const retries = Number(process.env.CHECK_LIVE_RETRIES || '1');
const retryDelayMs = Number(process.env.CHECK_LIVE_RETRY_DELAY_MS || '5000');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchText = async (u) => {
  const res = await fetch(u);
  const text = await res.text();
  return {res, text};
};

const absolute = (base, rel) => new URL(rel, base).toString();

const extract = (html, regex) => {
  const m = html.match(regex);
  return m ? m[1] : null;
};

const runCheck = async () => {
  const {res: htmlRes, text: html} = await fetchText(url);
  if (!htmlRes.ok) {
    throw new Error(`HTML request failed: ${htmlRes.status}`);
  }

  const jsPath = extract(html, /<script[^>]*src="([^"]+\.js)"/i);
  const cssPath = extract(html, /<link[^>]*href="([^"]+\.css)"/i);

  console.log(`HTML: ${htmlRes.status} ${url}`);

  if (!jsPath || !cssPath) {
    throw new Error('Could not find JS or CSS asset paths in HTML');
  }

  const jsUrl = absolute(url, jsPath);
  const cssUrl = absolute(url, cssPath);

  const [jsRes, cssRes] = await Promise.all([fetch(jsUrl), fetch(cssUrl)]);
  console.log(`JS:  ${jsRes.status} ${jsUrl}`);
  console.log(`CSS: ${cssRes.status} ${cssUrl}`);

  if (!jsRes.ok || !cssRes.ok) {
    throw new Error('Referenced assets did not return success status codes');
  }
};

(async () => {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    attempt += 1;
    try {
      await runCheck();
      return;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  console.error(lastError?.message || 'Live deploy check failed');
  process.exit(1);
})();
