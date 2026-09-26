const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\controllers\\payroll';

const patches = [
  { file: 'timesheetController.js', target: 'import Timesheet from "../../models/payroll/timesheetModel.js";', replacement: 'import * as Timesheet from "../../models/payroll/timesheetModel.js";' },
  { file: 'salaryHeadController.js', target: 'import SalaryHead from "../../models/payroll/salaryHeadModel.js";', replacement: 'import * as SalaryHead from "../../models/payroll/salaryHeadModel.js";' },
  { file: 'advancePaymentController.js', target: 'import AdvancePayment from "../../models/payroll/advancePaymentModel.js";', replacement: 'import * as AdvancePayment from "../../models/payroll/advancePaymentModel.js";' }
];

patches.forEach(p => {
  const filePath = path.join(dir, p.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(p.target, p.replacement);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Also remove alaryHeadController.js if it exists (probably a typo duplicate)
if (fs.existsSync(path.join(dir, 'alaryHeadController.js'))) {
  fs.unlinkSync(path.join(dir, 'alaryHeadController.js'));
}

console.log('Fixed model imports in controllers');
