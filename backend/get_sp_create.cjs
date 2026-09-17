const m = require('mysql2/promise'); 
m.createConnection({host:'localhost',user:'root',password:'Punit@12',database:'hrms',timezone:'local'})
.then(c => c.query('CALL sp_attendance_get_self("Employee", 1, "2026-09-16", "2026-09-16")')
.then(r => console.log(r[0])).catch(console.error).finally(()=>process.exit(0)))
