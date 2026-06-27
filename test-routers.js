const fs = require('fs');
const path = require('path');

const routersDir = './src/routers';
const files = fs.readdirSync(routersDir);

console.log('Checking router files...\n');

files.forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const router = require(path.join(routersDir, file));
      console.log(`✅ ${file}:`, typeof router);
      if (typeof router !== 'function') {
        console.log(`   ⚠️  This router exports:`, router);
        console.log(`   Expected: function, Received: ${typeof router}`);
      }
    } catch (err) {
      console.log(`❌ ${file}: Error -`, err.message);
    }
  }
});