const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?format=GLTF2&format=OBJ&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("format=GLTF2&format=OBJ", JSON.parse(data).assets[0].formats.map(f => f.formatType));
  });
});
