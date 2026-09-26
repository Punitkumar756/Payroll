const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\controllers\\payroll';

fs.readdirSync(dir).forEach(file => {
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  c = c.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};/g, (match, inner) => {
    // For module.exports = { ... }, we should replace it with export default { ... };
    return 'export default {' + inner + '};';
  });
  fs.writeFileSync(p, c);
});
console.log('Fixed exports');
