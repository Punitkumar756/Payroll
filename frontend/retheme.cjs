const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/New Hope/Desktop/pay/frontend/src/pages/admin/payroll';

function processFile(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace primary purple/indigo with HRMS corporate blue
    content = content.replace(/['"]#7c3aed['"]/gi, "'var(--clr-primary)'");
    content = content.replace(/['"]#9333ea['"]/gi, "'var(--clr-primary-light)'");
    content = content.replace(/['"]#6366f1['"]/gi, "'var(--clr-primary)'");

    // Replace light purple backgrounds with HRMS glow
    content = content.replace(/['"]#ede9fe['"]/gi, "'var(--clr-primary-glow)'");
    content = content.replace(/['"]#f3e8ff['"]/gi, "'var(--clr-primary-glow)'");
    content = content.replace(/['"]#f5f3ff['"]/gi, "'var(--clr-primary-glow)'");

    // Slate grays match the corporate theme mostly, but we could convert pure whites to base cards
    // content = content.replace(/['"]#ffffff['"]/gi, "'var(--clr-bg-card)'"); 

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Rethemed:", filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

traverseDir(targetDir);
console.log("Done retheming payroll module.");
