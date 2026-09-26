const fs = require('fs');

const filePath = 'c:/Users/New Hope/Desktop/pay/frontend/src/pages/admin/payroll/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/setEmployeeRows\(empData\);/, 'setEmployeeRows(empData.data || []);');

fs.writeFileSync(filePath, content);
console.log("Fixed empData.data in Dashboard.jsx");
