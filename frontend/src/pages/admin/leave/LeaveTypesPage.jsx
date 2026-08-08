import React from "react";
import MasterPage from "../../../components/MasterPage";
import { leaveApi } from "../../../api";

export default function LeaveTypesPage() {
  const apiAdapter = {
    list: leaveApi.listTypes,
    create: leaveApi.createType,
    update: leaveApi.updateType,
  };

  return (
    <MasterPage
      title="Leave Types"
      description="Manage leave types (Sick, Casual, Earned, etc.)"
      api={apiAdapter}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_paid",
          label: "Is Paid",
          render: (r) => (r.is_paid ? "Yes" : "No"),
        },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (r.is_active ? "Active" : "Inactive"),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "is_paid", label: "Is Paid Leave?", type: "checkbox" },
      ]}
    />
  );
}
