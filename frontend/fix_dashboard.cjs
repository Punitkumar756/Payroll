const fs = require('fs');

const filePath = 'c:/Users/New Hope/Desktop/pay/frontend/src/pages/admin/payroll/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove everything between {/* Mobile Header Bar */} and <main style={styles.contentArea} ...>
const startRegex = /\{\/\*\s*Mobile Header Bar\s*\*\/\}.*?<main[^>]*>/s;
content = content.replace(startRegex, '<main style={styles.contentArea} className="content-area-wrapper">');

// 2. Remove the activeTab conditionals. We want to JUST render the dashboard content.
// Look for {loading ? ... ) : activeTab === 'process-payslips' ? ... ) : ( ... <div style={styles.dashboardContainer}
// We want to replace it with just: {loading ? (...) : ( <div style={styles.dashboardContainer}...
const tabLogicRegex = /\{loading \? \((.*?)\)\s*:\s*activeTab === 'process-payslips'.*?\)\s*:\s*\(\s*(<div style=\{styles\.dashboardContainer\})/s;
content = content.replace(tabLogicRegex, '{loading ? ($1) : ($2');

// 3. At the bottom, remove the </main></div></div> and replace with just </main></div>
// If they have mismatched tags, let's fix the end.
const endRegex = /<\/main>\s*<\/div>\s*<\/div>\s*\)\s*;\s*}/s;
content = content.replace(endRegex, '</main>\n    </div>\n  );\n}');

fs.writeFileSync(filePath, content);
console.log("Dashboard layout fixed!");
