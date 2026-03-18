#!/usr/bin/env node

const url = process.argv[2] || 'https://andybak.github.io/icosa-gallery-vibe-coding-test/';

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

(async () => {
  const {res: htmlRes, text: html} = await fetchText(url);
  if (!htmlRes.ok) {
    console.error(`HTML request failed: ${htmlRes.status}`);
    process.exit(1);
  }

  const jsPath = extract(html, /<script[^>]*src="([^"]+\.js)"/i);
  const cssPath = extract(html, /<link[^>]*href="([^"]+\.css)"/i);

  console.log(`HTML: ${htmlRes.status} ${url}`);

  if (!jsPath || !cssPath) {
    console.error('Could not find JS or CSS asset paths in HTML');
    process.exit(2);
  }

  const jsUrl = absolute(url, jsPath);
  const cssUrl = absolute(url, cssPath);

  const [jsRes, cssRes] = await Promise.all([fetch(jsUrl), fetch(cssUrl)]);
  console.log(`JS:  ${jsRes.status} ${jsUrl}`);
  console.log(`CSS: ${cssRes.status} ${cssUrl}`);

  if (!jsRes.ok || !cssRes.ok) {
    process.exit(3);
  }
})();
