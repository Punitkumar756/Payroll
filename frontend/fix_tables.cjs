const fs = require('fs');

const FILE_PATH = 'c:/Users/New Hope/Desktop/pay/frontend/src/pages/admin/MasterPages.jsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const pages = [
  { name: 'Locations', colSpanStart: 8, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{l.code}</td>' },
  { name: 'Departments', colSpanStart: 5, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{d.code}</td>' },
  { name: 'Designations', colSpanStart: 7, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{d.code}</td>' },
  { name: 'Categories', colSpanStart: 5, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{c.code}</td>' },
  { name: 'Groups', colSpanStart: 5, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{g.code}</td>' },
  { name: 'Sub-Groups', colSpanStart: 6, theadStart: '<th>Code</th>', rowStart: '<td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{sg.code}</td>' },
];

pages.forEach(page => {
  // Find the block of code for the page
  const regex = new RegExp(`export function ${page.name.replace('-','')}Page\\(\\) \\{[\\s\\S]*?(?=export function|$)`, 'g');
  let match = regex.exec(content);
  if (match) {
    let block = match[0];
    
    // Replace colspans
    block = block.replace(new RegExp(`colSpan="${page.colSpanStart}"`, 'g'), `colSpan="${page.colSpanStart + 1}"`);
    
    // Add S. No. to thead
    block = block.replace('<tr>\\s*' + page.theadStart, `<tr>\n                <th>S. No.</th>\n                ${page.theadStart}`);
    
    // We can also just replace `<tr>\n                <th>Code</th>` 
    block = block.replace(/<tr>\s*<th>Code<\/th>/, `<tr>\n                <th>S. No.</th>\n                <th>Code</th>`);
    
    // Add S. No. to row
    block = block.replace(page.rowStart, `<td>{i + 1}</td>\n                      ${page.rowStart}`);
    
    content = content.substring(0, match.index) + block + content.substring(match.index + match[0].length);
  }
});

fs.writeFileSync(FILE_PATH, content);
console.log('Success');
