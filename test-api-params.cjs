const https = require('https');

const checkUrl = (url) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`Results: ${json.assets ? json.assets.length : 'none'}`);
        if (json.assets && json.assets.length > 0) {
           console.log(`First item: ${json.assets[0].name}`);
        }
      } catch (e) {
        console.log('Error parsing JSON');
      }
      console.log('---');
    });
  });
};

checkUrl('https://api.icosa.gallery/v1/assets?orderBy=BEST');
checkUrl('https://api.icosa.gallery/v1/assets?orderBy=NEWEST');
checkUrl('https://api.icosa.gallery/v1/assets?orderBy=OLDEST');
checkUrl('https://api.icosa.gallery/v1/assets?category=animals');
checkUrl('https://api.icosa.gallery/v1/assets?category=art');
checkUrl('https://api.icosa.gallery/v1/assets?format=GLTF2');
checkUrl('https://api.icosa.gallery/v1/assets?curated=true');
