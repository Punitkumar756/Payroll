import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProcessPayslips5D from "./pages/processPayslip";
import EditTimeSheets from "./pages/EditTimeSheets";
import AdvancePayments from "./pages/AdvancePayments";
import ApprovePayslip from "./pages/ApprovePayslip";
import payslip from "./pages/payslip";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/process-payslips" element={<ProcessPayslips5D />} />
      <Route path="/edit-timesheet" element={<EditTimeSheets />} />
      <Route path="/advance-payments" element={<AdvancePayments />} />
      <Route path="/approve-payslip" element={<ApprovePayslip />} />
      <Route path="/payslip" element={<payslip />} />
     
    </Routes>
  );
}

export default App;