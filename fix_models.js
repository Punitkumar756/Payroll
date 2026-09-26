const fs = require('fs');
const path = require('path');

const srcModel = 'c:\\Users\\New Hope\\Desktop\\pay\\payrolbc\\model';
const destModel = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\models\\payroll';
const controllersDir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\controllers\\payroll';

if (!fs.existsSync(destModel)) fs.mkdirSync(destModel, { recursive: true });

// Copy and transform models
fs.readdirSync(srcModel).forEach(file => {
  const p = path.join(srcModel, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Transform require to import
  content = content.replace(/const\s+\{\s*pool\s*\}\s*=\s*require\(["'].*?db["']\);/g, 'import pool from "../../db/pool.js";');
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(["'](.*?)["']\);/g, 'import $1 from "$2";');
  
  // module.exports to export const / default
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  content = content.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};/g, (match, inner) => {
    return 'export { ' + inner + ' };';
  });

  fs.writeFileSync(path.join(destModel, file), content, 'utf8');
});

// Update controllers to fix model imports
fs.readdirSync(controllersDir).forEach(file => {
  const p = path.join(controllersDir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace: import ... from "../model/dashboardModel" => import ... from "../../models/payroll/dashboardModel.js"
  content = content.replace(/from\s+["']\.\.\/model\/(.*?)["']/g, 'from "../../models/payroll/$1.js"');
  
  fs.writeFileSync(p, content, 'utf8');
});

console.log("Models fixed");
