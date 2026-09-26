const fs = require('fs');
const file = 'c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll\\Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<\/>\r?\n\s*\)\}\r?\n\r?\n\s*\{\/\* --- MODALS FOR FULLY FUNCTIONAL ACTIONS --- \*\/\}/g, '{/* --- MODALS FOR FULLY FUNCTIONAL ACTIONS --- */}');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed JSX error");
