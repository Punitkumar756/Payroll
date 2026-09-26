const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\routes\\payroll';

['payslipRoutes.js', 'payslipComponentRoutes.js'].forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /import payslipController from "\.\.\/\.\.\/controllers\/payroll\/payslipController\.js";/,
      'import * as payslipController from "../../controllers/payroll/payslipController.js";'
    );
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed payslipController imports in routes');
