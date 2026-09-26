const fs = require('fs');

const file = 'c:\\Users\\New Hope\\Desktop\\pay\\frontend\\src\\pages\\admin\\payroll\\Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace mock employeeRows with empty array
content = content.replace(/const \[employeeRows, setEmployeeRows\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/, 'const [employeeRows, setEmployeeRows] = useState([]);');

// Modify the useEffect to fetch employees
const fetchDashboardDataStr = `        const formattedDepartments = (data.departments || []).map(dept => ({
          ...dept,
          icon: iconMap[dept.iconKey] || Monitor
        }));

        setStatsData(formattedStats);
        setDepartmentData(formattedDepartments);`;

const newFetchStr = `        const formattedDepartments = (data.departments || []).map(dept => ({
          ...dept,
          icon: iconMap[dept.iconKey] || Monitor
        }));

        setStatsData(formattedStats);
        setDepartmentData(formattedDepartments);

        // Fetch Employees
        try {
          const empResponse = await fetch('http://localhost:5000/api/payroll/employees');
          const empData = await empResponse.json();
          if (empData.success && empData.employees) {
            setEmployeeRows(empData.employees.map(emp => ({ ...emp, id: emp.employeeId })));
          }
        } catch(err) {
          console.error("Error fetching employees", err);
        }`;

content = content.replace(fetchDashboardDataStr, newFetchStr);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated Dashboard.jsx to fetch employees");
