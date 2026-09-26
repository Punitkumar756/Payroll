const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\New Hope\\Desktop\\pay';
const payrolSrc = path.join(root, 'payrol', 'src');
const payrolbc = path.join(root, 'payrolbc');
const frontend = path.join(root, 'frontend', 'src');
const backend = path.join(root, 'backend', 'src');

function copyDir(src, dest, transform = null) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, transform);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      if (transform) content = transform(content, entry.name);
      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

// 1. Copy Frontend Pages
copyDir(path.join(payrolSrc, 'pages'), path.join(frontend, 'pages', 'admin', 'payroll'));
// 2. Copy Frontend Components
copyDir(path.join(payrolSrc, 'component'), path.join(frontend, 'components', 'payroll'));

// 3. Transform Backend
const cjsToEsm = (content, filename) => {
  // Convert requires to imports
  let newContent = content.replace(/const\s+\{\s*pool\s*\}\s*=\s*require\(["'].*?db["']\);/g, 'import pool from "../../db/pool.js";');
  newContent = newContent.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(["'](.*?)["']\);/g, 'import $1 from "$2";');
  newContent = newContent.replace(/const\s+\{\s*(.*?)\s*\}\s*=\s*require\(["'](.*?)["']\);/g, 'import { $1 } from "$2";');

  // Fix local route requires to add .js extension
  newContent = newContent.replace(/from\s+["']\.\.\/controllers\/(.*?)["']/g, 'from "../controllers/payroll/$1.js"');
  
  // Convert module.exports = router;
  newContent = newContent.replace(/module\.exports\s*=\s*router;/g, 'export default router;');

  // Convert exports.foo = ... to export const foo = ...
  newContent = newContent.replace(/exports\.([a-zA-Z0-9_]+)\s*=\s*(async\s+)?\(?(.*?)\)?\s*=>/g, 'export const $1 = $2($3) =>');
  
  // Quick fix for express router
  if (newContent.includes('express.Router()')) {
    newContent = newContent.replace(/import express from "express";/g, 'import { Router } from "express";\nconst express = { Router };');
  }

  return newContent;
};

copyDir(path.join(payrolbc, 'controllers'), path.join(backend, 'controllers', 'payroll'), cjsToEsm);
copyDir(path.join(payrolbc, 'routes'), path.join(backend, 'routes', 'payroll'), cjsToEsm);

console.log("Integration script completed.");
