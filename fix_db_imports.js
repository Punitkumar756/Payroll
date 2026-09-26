const fs = require('fs');
const path = require('path');

const modelsDir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\models\\payroll';
const controllerPath = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\controllers\\payroll\\payslipController.js';

function fixFile(p) {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/import db from "\.\.\/config\/db";/g, 'import db from "../../db/pool.js";');
  fs.writeFileSync(p, c);
}

fs.readdirSync(modelsDir).forEach(file => {
  fixFile(path.join(modelsDir, file));
});

fixFile(controllerPath);

console.log('Fixed db imports');
