const fs = require('fs');
const path = require('path');

const frontendDir = path.join('c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000/api/')) {
        content = content.replace(/http:\/\/localhost:5000\/api\//g, 'http://localhost:5000/api/payroll/');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(frontendDir);
console.log("Done");
