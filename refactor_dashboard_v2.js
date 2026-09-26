const fs = require('fs');

const file = 'c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll\\Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the return statement
const returnRegex = /return\s*\(\s*<div style=\{styles\.appContainer\}>[\s\S]*?(?=\{\/\* Top Metric Cards Grid \*\/})/;

if (returnRegex.test(content)) {
  content = content.replace(returnRegex, 'return (\n    <div className="payroll-dashboard-container animate-fade">\n      {toastMessage && (\n        <div style={styles.toastBanner}>\n          <CheckCircle2 size={14} color="#16a34a" />\n          <span>{toastMessage}</span>\n        </div>\n      )}\n\n      {/* Top Metric Cards Grid */}');
  
  // Now find the end
  const mainEndRegex = /<\/>\n\s*\)\}\n\n\s*({\/\* --- MODALS FOR FULLY FUNCTIONAL ACTIONS --- \*\/})/;
  content = content.replace(mainEndRegex, '$1');

  // And the closing main/div tags
  const closingTagsRegex = /<\/main>\s*<\/div>\s*<\/div>/;
  content = content.replace(closingTagsRegex, '</div>');

  fs.writeFileSync(file, content, 'utf8');
  console.log("Refactored Dashboard.jsx");
} else {
  console.log("Could not find return start via regex");
}
