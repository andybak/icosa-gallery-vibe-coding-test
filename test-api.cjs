const https = require('https');

https.get('https://api.icosa.gallery/v1/assets?format=GLTF2&format=OBJ&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("format=GLTF2&format=OBJ", JSON.parse(data).assets[0].formats.map(f => f.formatType));
  });
});

https.get('https://api.icosa.gallery/v1/assets?formatType=GLTF2&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("formatType=GLTF2", JSON.parse(data).assets[0].formats.map(f => f.formatType));
  });
});

https.get('https://api.icosa.gallery/v1/assets?formats=GLTF2&pageSize=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("formats=GLTF2", JSON.parse(data).assets[0].formats.map(f => f.formatType));
  });
});
