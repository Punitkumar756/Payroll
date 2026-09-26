const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\routes\\payroll';

const defaultExportControllers = [
  'advancePaymentController',
  'salaryHeadController',
  'timesheetController',
  'dashboardController',
  'employeeController'
];

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace: import * as something from "../../controllers/payroll/something.js";
    // With: import something from "../../controllers/payroll/something.js";
    // ONLY for defaultExportControllers

    defaultExportControllers.forEach(ctrl => {
      const regex = new RegExp(`import \\* as ${ctrl} from "\\.\\.\\/\\.\\.\\/controllers\\/payroll\\/${ctrl}\\.js";`, 'g');
      content = content.replace(regex, `import ${ctrl} from "../../controllers/payroll/${ctrl}.js";`);
    });

    // Also fix dashboard and employee, which might have different casing if used manually
    // dashboardController.js might be imported as DashboardController
    content = content.replace(/import \* as DashboardController from "\.\.\/\.\.\/controllers\/payroll\/dashboardController\.js";/g, 'import DashboardController from "../../controllers/payroll/dashboardController.js";');
    content = content.replace(/import \* as EmployeeController from "\.\.\/\.\.\/controllers\/payroll\/employeeController\.js";/g, 'import EmployeeController from "../../controllers/payroll/employeeController.js";');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed route imports for default export controllers');
