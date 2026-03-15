const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?category=art&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("category=art", JSON.parse(data).assets[0].formats.map(f => f.formatType));
  });
});
