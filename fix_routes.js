const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\New Hope\\Desktop\\pay\\backend\\src\\routes\\payroll';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');

    // Regex to match: const { ... } = require("../controllers/something");
    // We want to replace it with:
    // import something from "../../controllers/payroll/something.js";
    // const { ... } = something;

    content = content.replace(/const\s+\{([\s\S]*?)\}\s*=\s*require\((['"])(.*?)\2\);/g, (match, inner, quote, reqPath) => {
      const parts = reqPath.split('/');
      let controllerName = parts[parts.length - 1]; // e.g. advancePaymentController
      if (controllerName === 'advancePaymentController') {
        controllerName = 'advancePaymentController.js';
      } else if (!controllerName.endsWith('.js')) {
        controllerName += '.js';
      }

      const importName = controllerName.replace('.js', '');

      return `import ${importName} from "../../controllers/payroll/${controllerName}";\nconst {${inner}} = ${importName};`;
    });

    fs.writeFileSync(p, content, 'utf8');
  }
});
console.log('Fixed requires in routes');
