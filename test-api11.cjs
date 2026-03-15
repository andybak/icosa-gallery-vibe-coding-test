const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?format=GLTF2&format=OBJ&format=VOX&pageSize=10', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const assets = JSON.parse(data).assets;
    assets.forEach(a => {
      console.log(a.formats.map(f => f.formatType).join(', '));
    });
  });
});
