import React from "react";
import MasterPage from "../../../components/MasterPage";
import { payrollApi } from "../../../api";

export default function SalaryHeadsPage() {
  const apiAdapter = {
    list: payrollApi.listSalaryHeads,
    create: payrollApi.createSalaryHead,
    update: payrollApi.updateSalaryHead,
  };

  return (
    <MasterPage
      title="Salary Heads"
      description="Define earning and deduction components for CTC and Payroll"
      api={apiAdapter}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "head_type", label: "Type" },
        { key: "calculation_type", label: "Calculation" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (r.is_active ? "Active" : "Inactive"),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        {
          key: "head_type",
          label: "Type",
          type: "select",
          options: ["Earning", "Deduction", "Statutory"],
          required: true,
        },
        {
          key: "calculation_type",
          label: "Calculation",
          type: "select",
          options: ["Fixed", "Percentage", "Formula"],
          required: true,
        },
        { key: "is_taxable", label: "Is Taxable?", type: "checkbox" },
        {
          key: "is_pro_rata",
          label: "Pro-Rata based on Attendance?",
          type: "checkbox",
        },
      ]}
    />
  );
}
