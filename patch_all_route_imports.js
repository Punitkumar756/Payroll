const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\routes\\payroll';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace: import something from "../../controllers/payroll/something.js";
    // With: import * as something from "../../controllers/payroll/something.js";
    content = content.replace(/import ([a-zA-Z0-9_]+) from "\.\.\/\.\.\/controllers\/payroll\/\1\.js";/g, 'import * as $1 from "../../controllers/payroll/$1.js";');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed all controller imports in routes to use namespace import');
