const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFiles(dir, exts, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === 'build' || file === '.git') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, exts, fileList);
    } else {
      if (exts.includes(path.extname(filePath))) fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = [
  ...getFiles('./frontend/src', ['.ts', '.tsx']),
  ...getFiles('./backend/src', ['.ts']),
  './frontend/vite.config.ts'
].filter(Boolean);

for (const file of allFiles) {
  if (!fs.existsSync(file)) continue;
  
  let outExt = file.endsWith('.tsx') ? '.jsx' : '.js';
  // .d.ts files should just be deleted
  if (file.endsWith('.d.ts')) {
    fs.unlinkSync(file);
    console.log(`Deleted ${file}`);
    continue;
  }
  
  let outFile = file.replace(/\.tsx?$/, outExt);
  console.log(`Converting ${file} -> ${outFile}`);
  try {
    execSync(`npx detype "${file}" "${outFile}"`, { stdio: 'ignore' });
    fs.unlinkSync(file);
  } catch (err) {
    console.error(`Error converting ${file}`, err.message);
  }
}
