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
  // match import or export statement that starts with a relative path
  // import x from "./routes/auth";
  // export { y } from "../middleware/error";
  content = content.replace(/(import|export)\s+([^'"]*)\s+from\s+(['"])(\.\.?\/[^'"]+)(['"])/g, (match, impExp, vars, q1, modPath, q2) => {
    if (!modPath.endsWith('.js') && !modPath.endsWith('.json')) {
      changed = true;
      return `${impExp} ${vars} from ${q1}${modPath}.js${q2}`;
    }
    return match;
  });
  
  // also match import "./something"
  content = content.replace(/import\s+(['"])(\.\.?\/[^'"]+)(['"])/g, (match, q1, modPath, q2) => {
    if (!modPath.endsWith('.js') && !modPath.endsWith('.json')) {
      changed = true;
      return `import ${q1}${modPath}.js${q2}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file}`);
  }
}
