const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?format=VOX&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("format=VOX", data);
  });
});
