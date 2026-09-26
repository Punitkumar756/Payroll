const fs = require('fs');

const filePath = 'c:/Users/New Hope/Desktop/pay/frontend/src/pages/admin/payroll/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the hardcoded employeeRows useState with an empty array
const mockDataRegex = /const \[employeeRows, setEmployeeRows\] = useState\(\[\s*\{ id: 'EMP001'.*?\}\s*\]\);/s;
content = content.replace(mockDataRegex, 'const [employeeRows, setEmployeeRows] = useState([]);');

// 2. Add the API call to fetch employees in the useEffect
const useEffectFetch = `setDepartmentData(formattedDepartments);

        // Fetch Employees
        try {
          const empResponse = await fetch('http://localhost:5000/api/payroll/employees');
          if (empResponse.ok) {
            const empData = await empResponse.json();
            setEmployeeRows(empData);
          }
        } catch (e) {
          console.error("Failed to fetch employees", e);
        }

        setLoading(false);`;

content = content.replace(/setDepartmentData\(formattedDepartments\);\s*setLoading\(false\);/s, useEffectFetch);

fs.writeFileSync(filePath, content);
console.log("Patched Dashboard.jsx to fetch employees from DB");
