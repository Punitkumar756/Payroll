const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\routes\\payroll';

fs.readdirSync(dir).forEach(file => {
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/from "\.\.\/controllers\/payroll/g, 'from "../../controllers/payroll');
  fs.writeFileSync(p, c);
});
console.log('Fixed imports');
