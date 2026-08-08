const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      if (filePath.endsWith('.js')) fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getFiles('./backend/src');

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Remove import { Request, Response, NextFunction } from "express";
  // And similar express imports that only contain types.
  content = content.replace(/import\s+\{\s*(?:Request|Response|NextFunction|RequestHandler)(?:,\s*(?:Request|Response|NextFunction|RequestHandler))*\s*\}\s*from\s+['"]express['"];?/g, () => {
    changed = true;
    return '';
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned up express types in ${file}`);
  }
}
