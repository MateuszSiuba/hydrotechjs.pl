const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const run = (cmd) => {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT });
};

run('node scripts/validate-posts.js');
run('node scripts/optimize-images.js');
run('node scripts/generate-post-pages.js');
run('node scripts/update-sitemap.js');

console.log('All build steps completed.');
