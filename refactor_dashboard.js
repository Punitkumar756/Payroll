const fs = require('fs');

const file = 'c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll\\Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the return statement
const returnStart = content.indexOf('  return (\n    <div style={styles.appContainer}>');

if (returnStart !== -1) {
  // Find where the top metric cards grid starts (which is the actual dashboard content)
  const topMetricCardsStr = '              {/* Top Metric Cards Grid */}';
  const topMetricCardsIndex = content.indexOf(topMetricCardsStr);

  if (topMetricCardsIndex !== -1) {
    // Keep everything before the return statement
    let newContent = content.substring(0, returnStart);

    // Write the new return statement wrapper
    newContent += '  return (\n    <div className="payroll-dashboard-container animate-fade">\n';
    newContent += '      {toastMessage && (\n        <div style={styles.toastBanner}>\n          <CheckCircle2 size={14} color="#16a34a" />\n          <span>{toastMessage}</span>\n        </div>\n      )}\n\n';

    // We want the content from `topMetricCardsStr` down to the end of modals
    const modalsEndStr = '          {/* 1. Add New Employee Modal */}';
    // Actually, let's keep all the modals, which end before </main>
    const mainEndStr = '        </main>';
    const mainEndIndex = content.indexOf(mainEndStr);

    let dashboardContent = content.substring(topMetricCardsIndex, mainEndIndex);
    
    // The dashboardContent ends with a lot of indents and closing tags for the conditional render
    // Let's remove the conditional render closing that might be there.
    // wait, dashboardContent is inside:
    // ) : (
    //  <>
    //    {/* Top Metric Cards Grid */}
    //    ...
    //    </div>
    //  </>
    // )
    // Let's just strip the <> and </> and the conditional wrapper if it exists inside dashboardContent.
    
    // Instead of regex, let's use string manipulation to remove the `</>` at the end of the main view
    // if it exists, or just leave it. If we don't have the opening `<>` anymore, we must remove `</>`.
    dashboardContent = dashboardContent.replace(/<\/>\n\s*\)\}\n\n\s*{\/\* --- MODALS FOR FULLY FUNCTIONAL ACTIONS --- \*\//, '{/* --- MODALS FOR FULLY FUNCTIONAL ACTIONS --- */');
    
    newContent += dashboardContent;

    // Close our wrapper div
    newContent += '\n    </div>\n  );\n}\n\n';

    // Append the styles at the end
    const stylesIndex = content.indexOf('const styles = {');
    newContent += content.substring(stylesIndex);

    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Refactored Dashboard.jsx");
  } else {
    console.log("Could not find Top Metric Cards Grid");
  }
} else {
  console.log("Could not find return start");
}
