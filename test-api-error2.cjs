const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?orderBy=LIKED', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
});
