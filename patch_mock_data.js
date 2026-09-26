const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll';

const filesToPatch = [
  'AdvancePayments.jsx',
  'ApprovePayslip.jsx',
  'Dashboard.jsx',
  'EditTimeSheets.jsx',
  'payslip.jsx',
  'processPayslip.jsx'
];

filesToPatch.forEach(file => {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace API_BASE_URL
  content = content.replace(/const API_BASE_URL = 'http:\/\/localhost:5000\/api';/g, "const API_BASE_URL = 'http://localhost:5000/api/payroll';");

  // In payslip.jsx, remove initialRecords
  if (file === 'payslip.jsx') {
    content = content.replace(/const initialRecords = \[[\s\S]*?\];/, 'const initialRecords = [];');
    content = content.replace(/const initialComponents = \{[\s\S]*?\};/, 'const initialComponents = { earnings: [], deductions: [], employerComponents: [] };');
  }

  // In processPayslip.jsx, records is already [], but verify
  // In EditTimeSheets.jsx, employeeDataMap is hardcoded
  if (file === 'EditTimeSheets.jsx') {
    content = content.replace(/const \[employeeDataMap, setEmployeeDataMap\] = useState\(\{[\s\S]*?\}\);/, 'const [employeeDataMap, setEmployeeDataMap] = useState({});');
  }

  fs.writeFileSync(p, content, 'utf8');
});
console.log("Patched mock data and API_BASE_URL in payroll pages");
